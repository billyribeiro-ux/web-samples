"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ensureDbUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { getCartForSession } from "@/app/actions/cart";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function createSubscriptionCheckoutAction(planSlug: string, interval: "month" | "year") {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("STRIPE_SECRET_KEY missing");
    return null;
  }

  const user = await ensureDbUser();
  if (!user) return null;

  const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
  if (!plan) return null;

  const priceId =
    interval === "year" ? plan.stripePriceYearlyId ?? plan.stripePriceMonthlyId : plan.stripePriceMonthlyId;
  if (!priceId) {
    console.warn("Plan missing Stripe price IDs — set in DB or seed.");
    return null;
  }

  const stripe = getStripe();
  let customerId = user.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { clerkId: user.clerkId, userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}&type=subscription`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { userId: user.id, planId: plan.id },
    subscription_data: {
      metadata: { userId: user.id, planId: plan.id },
    },
  });

  return session.url;
}

export async function createCartCheckoutSessionAction() {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) return null;

  const cart = await getCartForSession();
  if (!cart?.items.length) return null;

  const { userId } = await auth();
  const user = userId ? await ensureDbUser() : null;

  const stripe = getStripe();
  let customerId: string | undefined = user?.stripeCustomerId ?? undefined;
  if (user && !customerId) {
    const c = await stripe.customers.create({
      email: user.email,
      metadata: { clerkId: user.clerkId, userId: user.id },
    });
    customerId = c.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const line_items = cart.items
    .filter((i) => i.product.stripePriceId)
    .map((i) => ({
      price: i.product.stripePriceId!,
      quantity: i.quantity,
    }));

  if (!line_items.length) {
    // Fallback: price_data from DB amounts (one-time payment)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      customer_email: !customerId && user ? user.email : undefined,
      line_items: cart.items.map((i) => ({
        quantity: i.quantity,
        price_data: {
          currency: i.product.currency,
          unit_amount: i.product.priceCents,
          product_data: { name: i.product.title },
        },
      })),
      success_url: `${appUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}&type=payment`,
      cancel_url: `${appUrl}/cart`,
      metadata: { cartSessionId: cart.id, userId: user?.id ?? "" },
    });
    return session.url;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    customer_email: !customerId && user ? user.email : undefined,
    line_items,
    success_url: `${appUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}&type=payment`,
    cancel_url: `${appUrl}/cart`,
    metadata: { cartSessionId: cart.id, userId: user?.id ?? "" },
  });

  return session.url;
}

export async function createBillingPortalSessionAction() {
  const { userId } = await auth();
  if (!userId) redirect("/login");
  if (!process.env.STRIPE_SECRET_KEY) return null;

  const user = await ensureDbUser();
  if (!user?.stripeCustomerId) return null;

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/account/subscription`,
  });
  return session.url;
}
