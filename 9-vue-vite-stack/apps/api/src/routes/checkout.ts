import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { getStripe } from "../services/stripeClient.js";
import { ensureGuestCookie } from "../lib/guest.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const checkoutRouter = Router();

async function loadCartForCheckout(req: Express.Request, res: import("express").Response) {
  const userId = req.sessionRecord?.user?.id;
  if (userId) {
    return prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
  }
  const gid = ensureGuestCookie(req.env, res, req.cookies);
  return prisma.cart.findUnique({
    where: { guestId: gid },
    include: { items: { include: { product: true } } },
  });
}

checkoutRouter.post("/cart", async (req, res, next) => {
  try {
    const stripe = getStripe(req.env);
    if (!stripe) return next(new HttpError(503, "Payments not configured"));
    const successUrl = req.env.STRIPE_SUCCESS_URL ?? `${req.env.WEB_ORIGIN}/thank-you`;
    const cancelUrl = req.env.STRIPE_CANCEL_URL ?? `${req.env.WEB_ORIGIN}/cart`;

    const cart = await loadCartForCheckout(req, res);
    if (!cart?.items.length) return next(new HttpError(400, "Cart is empty"));

    const line_items = cart.items.map(
      (i: { quantity: number; product: { currency: string; priceCents: number; name: string } }) => ({
        quantity: i.quantity,
        price_data: {
          currency: i.product.currency,
          unit_amount: i.product.priceCents,
          product_data: { name: i.product.name },
        },
      })
    );

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      customer_email: req.sessionRecord?.user?.email,
      metadata: {
        cartId: cart.id,
        userId: req.sessionRecord?.user?.id ?? "",
      },
    });

    res.json({ url: session.url, id: session.id });
  } catch (e) {
    next(e);
  }
});

checkoutRouter.post(
  "/subscription",
  requireAuth,
  async (req, res, next) => {
    try {
      const stripe = getStripe(req.env);
      if (!stripe) return next(new HttpError(503, "Payments not configured"));
      const parsed = z
        .object({
          planSlug: z.string().min(1),
          interval: z.enum(["month", "year"]),
        })
        .safeParse(req.body);
      if (!parsed.success) return next(new HttpError(400, "Invalid input"));

      const plan = await prisma.plan.findUnique({ where: { slug: parsed.data.planSlug } });
      if (!plan) return next(new HttpError(404, "Plan not found"));

      const amount =
        parsed.data.interval === "year" ? plan.priceYearlyCents : plan.priceMonthlyCents;

      const successUrl = req.env.STRIPE_SUCCESS_URL ?? `${req.env.WEB_ORIGIN}/thank-you`;
      const cancelUrl = req.env.STRIPE_CANCEL_URL ?? `${req.env.WEB_ORIGIN}/pricing`;

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: amount,
              recurring: { interval: parsed.data.interval },
              product_data: { name: plan.name },
            },
          },
        ],
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        customer_email: req.sessionRecord!.user.email,
        metadata: {
          planId: plan.id,
          userId: req.sessionRecord!.user.id,
        },
      });

      res.json({ url: session.url, id: session.id });
    } catch (e) {
      next(e);
    }
  }
);

checkoutRouter.post("/portal", requireAuth, async (req, res, next) => {
  try {
    const stripe = getStripe(req.env);
    if (!stripe) return next(new HttpError(503, "Payments not configured"));
    const sub = await prisma.subscription.findFirst({
      where: { userId: req.sessionRecord!.user.id, stripeCustomerId: { not: null } },
      orderBy: { createdAt: "desc" },
    });
    if (!sub?.stripeCustomerId) {
      return next(new HttpError(400, "No billing customer on file"));
    }
    const returnUrl = `${req.env.WEB_ORIGIN}/account/subscription`;
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: returnUrl,
    });
    res.json({ url: portal.url });
  } catch (e) {
    next(e);
  }
});
