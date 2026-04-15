import { Router, raw } from "express";
import Stripe from "stripe";
import { prisma } from "../../lib/prisma.js";
import { getStripe } from "../../lib/stripe.js";
import type { Env } from "../../config.js";
import { SubscriptionStatus } from "@prisma/client";

export function stripeWebhookRouter(env: Env) {
  const r = Router();
  const stripe = getStripe(env);

  r.post("/", raw({ type: "application/json" }), async (req, res) => {
    if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
      res.status(503).send("Stripe not configured");
      return;
    }
    const sig = req.headers["stripe-signature"];
    if (typeof sig !== "string") {
      res.status(400).send("Missing signature");
      return;
    }
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error(err);
      res.status(400).send("Invalid signature");
      return;
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.mode === "payment" && session.id) {
            await prisma.order.updateMany({
              where: { stripeSessionId: session.id },
              data: {
                status: "PAID",
                stripePaymentId:
                  typeof session.payment_intent === "string" ? session.payment_intent : undefined,
              },
            });
          }
          if (session.mode === "subscription" && session.metadata?.userId && session.metadata?.planId) {
            const subId = typeof session.subscription === "string" ? session.subscription : null;
            if (subId) {
              const stripeSub = await stripe.subscriptions.retrieve(subId);
              await prisma.subscription.upsert({
                where: { stripeSubscriptionId: subId },
                create: {
                  userId: session.metadata.userId,
                  planId: session.metadata.planId,
                  status: mapStripeSubStatus(stripeSub.status),
                  stripeSubscriptionId: subId,
                  stripePriceId: stripeSub.items.data[0]?.price.id,
                  currentPeriodEnd: stripeSub.current_period_end
                    ? new Date(stripeSub.current_period_end * 1000)
                    : null,
                  cancelAtPeriodEnd: stripeSub.cancel_at_period_end ?? false,
                },
                update: {
                  status: mapStripeSubStatus(stripeSub.status),
                  currentPeriodEnd: stripeSub.current_period_end
                    ? new Date(stripeSub.current_period_end * 1000)
                    : null,
                  cancelAtPeriodEnd: stripeSub.cancel_at_period_end ?? false,
                },
              });
            }
          }
          break;
        }
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;
          const stripeSubId = sub.id;
          const existing = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: stripeSubId },
          });
          if (existing) {
            await prisma.subscription.update({
              where: { id: existing.id },
              data: {
                status:
                  event.type === "customer.subscription.deleted"
                    ? SubscriptionStatus.CANCELED
                    : mapStripeSubStatus(sub.status),
                currentPeriodEnd: sub.current_period_end
                  ? new Date(sub.current_period_end * 1000)
                  : null,
                cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
              },
            });
          }
          break;
        }
        default:
          break;
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Webhook handler failed" });
      return;
    }

    res.json({ received: true });
  });

  return r;
}

function mapStripeSubStatus(s: Stripe.Subscription.Status): SubscriptionStatus {
  switch (s) {
    case "active":
      return SubscriptionStatus.ACTIVE;
    case "trialing":
      return SubscriptionStatus.TRIALING;
    case "past_due":
      return SubscriptionStatus.PAST_DUE;
    case "canceled":
    case "unpaid":
      return SubscriptionStatus.CANCELED;
    case "incomplete":
    case "incomplete_expired":
      return SubscriptionStatus.INCOMPLETE;
    default:
      return SubscriptionStatus.UNPAID;
  }
}
