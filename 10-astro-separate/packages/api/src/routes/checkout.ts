import { Hono } from "hono";
import { z } from "zod";
import Stripe from "stripe";
import { prisma } from "@repo/db";
import { SessionScope } from "@repo/db";
import { loadSession } from "../middleware/session.js";
import type { AppEnv } from "../types.js";
import { ApiError } from "../lib/errors.js";
import { config } from "../lib/config.js";
import { randomToken } from "../lib/token.js";

function stripeClient() {
  const key = config.stripeSecretKey();
  if (!key) return null;
  return new Stripe(key, { typescript: true });
}

export const checkoutRoutes = new Hono<AppEnv>();
checkoutRoutes.use("*", loadSession(SessionScope.MEMBER));

checkoutRoutes.post("/cart", async (c) => {
  const stripe = stripeClient();
  if (!stripe) throw new ApiError(503, "Stripe not configured", "STRIPE_DISABLED");

  const body = z
    .object({
      email: z.string().email(),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
    })
    .parse(await c.req.json());

  const user = c.get("authUser");
  let cart = user
    ? await prisma.cart.findUnique({
        where: { userId: user.id },
        include: { items: { include: { product: true } } },
      })
    : null;

  if (!cart) {
    const guestKey = c.req.header("x-guest-cart");
    if (!guestKey) throw new ApiError(400, "Missing guest cart", "NO_CART");
    cart = await prisma.cart.findUnique({
      where: { guestKey },
      include: { items: { include: { product: true } } },
    });
  }

  if (!cart || cart.items.length === 0) throw new ApiError(400, "Cart is empty", "EMPTY_CART");

  const line_items = cart.items.map((item) => {
    if (item.product.stripePriceId) {
      return { price: item.product.stripePriceId, quantity: item.quantity } as const;
    }
    return {
      quantity: item.quantity,
      price_data: {
        currency: item.product.currency,
        unit_amount: item.product.priceCents,
        product_data: { name: item.product.name },
      },
    } as const;
  });

  const order = await prisma.order.create({
    data: {
      userId: user?.id,
      email: body.email.toLowerCase(),
      status: "PENDING",
      totalCents: cart.items.reduce((sum, i) => sum + i.product.priceCents * i.quantity, 0),
      currency: cart.items[0]?.product.currency ?? "usd",
      items: {
        create: cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPriceCents: i.product.priceCents,
        })),
      },
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: body.email.toLowerCase(),
    success_url: `${body.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: body.cancelUrl,
    line_items,
    metadata: {
      orderId: order.id,
      cartId: cart.id,
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  return c.json({ url: session.url, orderId: order.id });
});

checkoutRoutes.post("/subscription", async (c) => {
  const stripe = stripeClient();
  if (!stripe) throw new ApiError(503, "Stripe not configured", "STRIPE_DISABLED");

  const user = c.get("authUser");
  if (!user) throw new ApiError(401, "Sign in required", "UNAUTHORIZED");

  const body = z
    .object({
      planSlug: z.string().min(1),
      interval: z.enum(["month", "year"]),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
    })
    .parse(await c.req.json());

  const plan = await prisma.plan.findUnique({ where: { slug: body.planSlug } });
  if (!plan) throw new ApiError(404, "Plan not found", "NOT_FOUND");

  const priceId =
    body.interval === "year" ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;
  if (!priceId) throw new ApiError(503, "Plan missing Stripe price ids", "STRIPE_PRICE_MISSING");

  const customerId =
    user.stripeCustomerId ??
    (
      await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      })
    ).id;

  if (!user.stripeCustomerId) {
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const subscription = await prisma.subscription.create({
    data: {
      userId: user.id,
      planId: plan.id,
      status: "INCOMPLETE",
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    success_url: `${body.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: body.cancelUrl,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      userId: user.id,
      subscriptionId: subscription.id,
      planId: plan.id,
    },
  });

  return c.json({ url: session.url, subscriptionId: subscription.id });
});

checkoutRoutes.post("/portal", async (c) => {
  const stripe = stripeClient();
  if (!stripe) throw new ApiError(503, "Stripe not configured", "STRIPE_DISABLED");
  const user = c.get("authUser");
  if (!user?.stripeCustomerId) throw new ApiError(400, "No billing customer", "NO_CUSTOMER");

  const body = z.object({ returnUrl: z.string().url() }).parse(await c.req.json());
  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: body.returnUrl,
  });
  return c.json({ url: portal.url });
});
