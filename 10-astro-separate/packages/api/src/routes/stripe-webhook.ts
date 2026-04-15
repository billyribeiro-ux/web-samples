import { Hono } from "hono";
import Stripe from "stripe";
import { prisma } from "@repo/db";
import { config } from "../lib/config.js";

export const stripeWebhookRoutes = new Hono();

stripeWebhookRoutes.post("/", async (c) => {
  const secret = config.stripeWebhookSecret();
  const key = config.stripeSecretKey();
  if (!secret || !key) {
    return c.text("Stripe webhook not configured", 503);
  }

  const stripe = new Stripe(key, { typescript: true });
  const sig = c.req.header("stripe-signature");
  const raw = await c.req.text();
  if (!sig) return c.text("Missing signature", 400);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid";
    return c.text(`Webhook Error: ${message}`, 400);
  }

  const existing = await prisma.stripeEvent.findUnique({ where: { eventId: event.id } });
  if (existing?.processed) {
    return c.json({ received: true, duplicate: true });
  }

  const payload = JSON.parse(JSON.stringify(event)) as object;
  await prisma.stripeEvent.upsert({
    where: { eventId: event.id },
    update: { payload },
    create: { eventId: event.id, payload },
  });

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "payment" && session.metadata?.orderId) {
        await prisma.order.update({
          where: { id: session.metadata.orderId },
          data: {
            status: "PAID",
            stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
          },
        });
        if (session.metadata.cartId) {
          await prisma.cartItem.deleteMany({ where: { cartId: session.metadata.cartId } });
        }
      }
      if (session.mode === "subscription" && session.metadata?.subscriptionId) {
        const subId = session.metadata.subscriptionId;
        const stripeSubId = typeof session.subscription === "string" ? session.subscription : null;
        await prisma.subscription.update({
          where: { id: subId },
          data: {
            status: "ACTIVE",
            stripeSubscriptionId: stripeSubId,
            currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          },
        });
      }
    }
  } catch (e) {
    console.error(e);
    return c.text("Handler error", 500);
  }

  await prisma.stripeEvent.update({
    where: { eventId: event.id },
    data: { processed: true },
  });

  return c.json({ received: true });
});
