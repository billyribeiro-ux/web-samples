import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { OrderStatus, SubscriptionStatus, UserRole } from "@prisma/client";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";

/** Stripe API typings occasionally lag behind API fields; subscription periods are always present on webhook payloads. */
function subscriptionPeriods(sub: Stripe.Subscription) {
  const s = sub as unknown as {
    current_period_start: number;
    current_period_end: number;
    cancel_at_period_end?: boolean | null;
  };
  return {
    currentPeriodStart: new Date(s.current_period_start * 1000),
    currentPeriodEnd: new Date(s.current_period_end * 1000),
    cancelAtPeriodEnd: s.cancel_at_period_end ?? false,
  };
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("STRIPE_WEBHOOK_SECRET not configured", { status: 500 });
  }

  const body = await req.text();
  const h = await headers();
  const sig = h.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const idem = await prisma.processedWebhookEvent.findFirst({
    where: { source: "stripe", eventId: event.id },
  });

  if (idem) return new Response("ok", { status: 200 });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "payment") {
          const cartSessionId = session.metadata?.cartSessionId;
          const rawUserId = session.metadata?.userId;
          const userId = rawUserId && rawUserId.length > 0 ? rawUserId : undefined;
          const total = session.amount_total ?? 0;
          const order = await prisma.order.create({
            data: {
              userId: userId || null,
              email: session.customer_details?.email ?? session.customer_email ?? null,
              stripeCheckoutSessionId: session.id,
              status: OrderStatus.PAID,
              totalCents: total,
              currency: session.currency ?? "usd",
              metadata: session.metadata as object,
            },
          });
          if (cartSessionId) {
            const cart = await prisma.cartSession.findUnique({
              where: { id: cartSessionId },
              include: { items: true },
            });
            if (cart) {
              for (const line of cart.items) {
                const product = await prisma.product.findUnique({ where: { id: line.productId } });
                if (!product) continue;
                await prisma.orderItem.create({
                  data: {
                    orderId: order.id,
                    productId: product.id,
                    quantity: line.quantity,
                    unitPriceCents: product.priceCents,
                    titleSnapshot: product.title,
                  },
                });
              }
              await prisma.cartItem.deleteMany({ where: { cartSessionId } });
            }
          }
        }
        if (session.mode === "subscription" && session.subscription) {
          const userId = session.metadata?.userId;
          const planId = session.metadata?.planId;
          if (userId && planId) {
            const sub = (await getStripe().subscriptions.retrieve(
              session.subscription as string,
            )) as Stripe.Subscription;
            const periods = subscriptionPeriods(sub);
            await prisma.subscription.upsert({
              where: { stripeSubscriptionId: sub.id },
              create: {
                userId,
                planId,
                stripeSubscriptionId: sub.id,
                stripePriceId: sub.items.data[0]?.price.id,
                status: mapStripeSubscriptionStatus(sub.status),
                currentPeriodStart: periods.currentPeriodStart,
                currentPeriodEnd: periods.currentPeriodEnd,
                cancelAtPeriodEnd: periods.cancelAtPeriodEnd,
              },
              update: {
                status: mapStripeSubscriptionStatus(sub.status),
                stripePriceId: sub.items.data[0]?.price.id,
                currentPeriodStart: periods.currentPeriodStart,
                currentPeriodEnd: periods.currentPeriodEnd,
                cancelAtPeriodEnd: periods.cancelAtPeriodEnd,
              },
            });
            await prisma.user.update({
              where: { id: userId },
              data: { role: UserRole.SUBSCRIBER },
            });
          }
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const periods = subscriptionPeriods(sub);
        const existing = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: sub.id },
        });
        if (existing) {
          const canceledAt = (sub as unknown as { canceled_at?: number | null }).canceled_at;
          await prisma.subscription.update({
            where: { stripeSubscriptionId: sub.id },
            data: {
              status: mapStripeSubscriptionStatus(sub.status),
              currentPeriodStart: periods.currentPeriodStart,
              currentPeriodEnd: periods.currentPeriodEnd,
              cancelAtPeriodEnd: periods.cancelAtPeriodEnd,
              canceledAt: canceledAt ? new Date(canceledAt * 1000) : null,
            },
          });
          if (sub.status === "canceled" || sub.status === "unpaid") {
            await prisma.user.update({
              where: { id: existing.userId },
              data: { role: UserRole.USER },
            });
          }
        }
        break;
      }
      default:
        break;
    }

    await prisma.processedWebhookEvent.create({
      data: { source: "stripe", eventId: event.id },
    });
  } catch (e) {
    console.error("stripe webhook handler", e);
    return new Response("handler error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}

function mapStripeSubscriptionStatus(s: Stripe.Subscription.Status): SubscriptionStatus {
  switch (s) {
    case "active":
      return SubscriptionStatus.ACTIVE;
    case "canceled":
      return SubscriptionStatus.CANCELED;
    case "past_due":
      return SubscriptionStatus.PAST_DUE;
    case "trialing":
      return SubscriptionStatus.TRIALING;
    case "unpaid":
      return SubscriptionStatus.UNPAID;
    case "incomplete":
      return SubscriptionStatus.INCOMPLETE;
    case "incomplete_expired":
      return SubscriptionStatus.INCOMPLETE_EXPIRED;
    default:
      return SubscriptionStatus.INCOMPLETE;
  }
}
