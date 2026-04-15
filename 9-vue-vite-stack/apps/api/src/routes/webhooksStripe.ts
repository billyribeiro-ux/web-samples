import { Router } from "express";
import type { Prisma } from "@prisma/client";
import Stripe from "stripe";
import { prisma } from "../lib/prisma.js";
import { getStripe } from "../services/stripeClient.js";
import { HttpError } from "../lib/errors.js";

export const webhooksStripeRouter = Router();

webhooksStripeRouter.post("/", async (req, res, next) => {
  try {
    const stripe = getStripe(req.env);
    if (!stripe) throw new HttpError(503, "Stripe not configured");
    const secret = req.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new HttpError(503, "Webhook secret not configured");

    const sig = req.headers["stripe-signature"];
    if (typeof sig !== "string") throw new HttpError(400, "Missing signature");

    const rawBody = req.body;
    if (!Buffer.isBuffer(rawBody)) {
      throw new HttpError(400, "Invalid body");
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, secret);
    } catch {
      throw new HttpError(400, "Invalid signature");
    }

    const existing = await prisma.processedStripeEvent.findUnique({
      where: { eventId: event.id },
    });
    if (existing) {
      return res.json({ received: true, duplicate: true });
    }

    await prisma.processedStripeEvent.create({
      data: { eventId: event.id, type: event.type },
    });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "payment") {
        const cartId = session.metadata?.cartId;
        const userId = session.metadata?.userId || null;
        if (cartId) {
          const cart = await prisma.cart.findUnique({
            where: { id: cartId },
            include: { items: { include: { product: true } } },
          });
          if (cart?.items.length) {
            const totalCents = cart.items.reduce(
              (
                sum: number,
                i: { quantity: number; product: { priceCents: number; currency: string } }
              ) => sum + i.product.priceCents * i.quantity,
              0
            );
            await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
              await tx.order.create({
                data: {
                  userId: userId || null,
                  status: "PAID",
                  totalCents,
                  currency: cart.items[0]?.product.currency ?? "usd",
                  stripeCheckoutSessionId: session.id,
                  items: {
                    create: cart.items.map(
                      (i: {
                        productId: string;
                        quantity: number;
                        product: { priceCents: number };
                      }) => ({
                        productId: i.productId,
                        quantity: i.quantity,
                        unitPriceCents: i.product.priceCents,
                      })
                    ),
                  },
                },
              });
              await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
            });
          }
        }
      }

      if (session.mode === "subscription") {
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        const subId = typeof session.subscription === "string" ? session.subscription : null;
        const customerId = typeof session.customer === "string" ? session.customer : null;
        if (userId && planId && subId) {
          await prisma.subscription.upsert({
            where: { stripeSubscriptionId: subId },
            create: {
              userId,
              planId,
              status: "ACTIVE",
              stripeSubscriptionId: subId,
              stripeCustomerId: customerId,
              currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
            },
            update: {
              status: "ACTIVE",
              stripeCustomerId: customerId ?? undefined,
              currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
            },
          });
        }
      }
    }

    res.json({ received: true });
  } catch (e) {
    next(e);
  }
});
