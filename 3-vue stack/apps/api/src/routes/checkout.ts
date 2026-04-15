import { Router } from "express";
import type Stripe from "stripe";
import { prisma } from "../lib/prisma.js";
import { getStripe } from "../lib/stripe.js";
import type { Env } from "../config.js";
import { requireUser } from "../middleware/auth.js";
import { createMailer } from "../lib/email.js";

export function checkoutRouter(env: Env) {
  const r = Router();
  const mail = createMailer(env);

  r.post("/create-session", async (req, res) => {
    const stripe = getStripe(env);
    const body = req.body as {
      items: { productId: string; quantity: number }[];
      email?: string;
      successPath?: string;
      cancelPath?: string;
      promoCode?: string;
    };
    if (!stripe || !body.items?.length) {
      res.status(400).json({ error: "Invalid checkout request" });
      return;
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let totalCents = 0;
    const orderItemsData: { productId: string; quantity: number; unitCents: number }[] = [];

    for (const line of body.items) {
      const product = await prisma.product.findUnique({ where: { id: line.productId } });
      if (!product) {
        res.status(400).json({ error: `Unknown product ${line.productId}` });
        return;
      }
      const qty = Math.max(1, line.quantity);
      totalCents += product.priceCents * qty;
      orderItemsData.push({ productId: product.id, quantity: qty, unitCents: product.priceCents });
      if (product.stripePriceId) {
        lineItems.push({ price: product.stripePriceId, quantity: qty });
      } else {
        lineItems.push({
          quantity: qty,
          price_data: {
            currency: product.currency,
            product_data: { name: product.name },
            unit_amount: product.priceCents,
          },
        });
      }
    }

    const order = await prisma.order.create({
      data: {
        email: body.email ?? "guest@pending.local",
        status: "PENDING",
        amountCents: totalCents,
        promoCode: body.promoCode ?? null,
        items: { create: orderItemsData },
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${env.APP_URL}${body.successPath ?? "/thank-you"}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}${body.cancelPath ?? "/cart"}`,
      customer_email: body.email,
      client_reference_id: order.id,
      metadata: {
        orderId: order.id,
        promoCode: body.promoCode ?? "",
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    res.json({ url: session.url, sessionId: session.id });
  });

  r.post("/portal-subscription", requireUser, async (req, res) => {
    const stripe = getStripe(env);
    const userId = req.session.userId!;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!stripe || !user?.stripeCustomerId) {
      res.status(400).json({ error: "Billing not available" });
      return;
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${env.APP_URL}/account/subscription`,
    });
    res.json({ url: session.url });
  });

  r.post("/subscription-session", requireUser, async (req, res) => {
    const stripe = getStripe(env);
    const body = req.body as { priceId?: string; successPath?: string };
    const userId = req.session.userId!;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const plan = body.priceId
      ? await prisma.plan.findFirst({ where: { stripePriceId: body.priceId } })
      : await prisma.plan.findFirst({ where: { isDefaultFree: false } });
    if (!stripe || !plan?.stripePriceId) {
      res.status(400).json({ error: "Subscription unavailable" });
      return;
    }
    let customerId = user?.stripeCustomerId;
    if (!customerId && user) {
      const c = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } });
      customerId = c.id;
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: c.id } });
    }
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId!,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${env.APP_URL}${body.successPath ?? "/account/subscription"}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}/pricing`,
      metadata: { userId, planId: plan.id },
    });
    res.json({ url: session.url });
  });

  r.get("/order-by-session/:sessionId", async (req, res) => {
    const order = await prisma.order.findFirst({
      where: { stripeSessionId: String(req.params.sessionId) },
      include: { items: { include: { product: true } } },
    });
    if (!order) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(order);
  });

  r.post("/finalize-session", async (req, res) => {
    const stripe = getStripe(env);
    const sessionId = String((req.body as { sessionId?: string }).sessionId ?? "");
    if (!stripe || !sessionId) {
      res.status(400).json({ error: "Missing session" });
      return;
    }
    const s = await stripe.checkout.sessions.retrieve(sessionId);
    const order = await prisma.order.findFirst({ where: { stripeSessionId: sessionId } });
    if (order && s.payment_status === "paid") {
      const pi =
        typeof s.payment_intent === "string"
          ? s.payment_intent
          : s.payment_intent && typeof s.payment_intent === "object" && "id" in s.payment_intent
            ? (s.payment_intent as { id: string }).id
            : undefined;
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          stripePaymentId: pi,
        },
      });
      await mail.sendOrderReceipt(order.email, order.id);
    }
    res.json({ ok: true });
  });

  return r;
}
