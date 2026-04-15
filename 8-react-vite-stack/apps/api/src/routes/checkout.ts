import { Router } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import type { Env } from '../lib/env.js';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';
import {
  attachDbUserOptional,
  requireDbUser,
  type RequestWithUser,
} from '../middleware/dbUser.js';

const bodySchema = z.object({
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  guestEmail: z.string().email().optional(),
});

export function createCheckoutRouter(env: Env) {
  const router = Router();
  router.use(attachDbUserOptional);

  router.post(
    '/session',
    asyncHandler(async (req: RequestWithUser, res) => {
      if (!env.STRIPE_SECRET_KEY) {
        throw new HttpError(503, 'Stripe is not configured');
      }
      const stripe = new Stripe(env.STRIPE_SECRET_KEY);
      const { successUrl, cancelUrl, guestEmail } = bodySchema.parse(req.body);
      const sessionId = req.cookies['cart_session'] as string | undefined;
      if (!sessionId) throw new HttpError(400, 'No cart');

      const cart = await prisma.cart.findUnique({
        where: { sessionId },
        include: { items: { include: { product: true } } },
      });
      if (!cart?.items.length) throw new HttpError(400, 'Cart is empty');

      const user = req.dbUser;
      const customerEmail = user?.email ?? guestEmail;
      if (!customerEmail) {
        throw new HttpError(400, 'Email required for guest checkout');
      }

      let totalCents = 0;
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      for (const line of cart.items) {
        const p = line.product;
        if (p.status !== 'ACTIVE') continue;
        totalCents += p.priceCents * line.quantity;
        if (p.stripePriceId) {
          lineItems.push({ price: p.stripePriceId, quantity: line.quantity });
        } else {
          lineItems.push({
            quantity: line.quantity,
            price_data: {
              currency: p.currency,
              unit_amount: p.priceCents,
              product_data: { name: p.title },
            },
          });
        }
      }
      if (!lineItems.length) throw new HttpError(400, 'No purchasable items');

      const order = await prisma.order.create({
        data: {
          userId: user?.id,
          guestEmail: user ? undefined : customerEmail,
          status: 'PENDING',
          totalCents,
          currency: cart.items[0]?.product.currency ?? 'usd',
          items: {
            create: cart.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitCents: i.product.priceCents,
            })),
          },
        },
      });

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: customerEmail,
        line_items: lineItems,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          orderId: order.id,
          userId: user?.id ?? '',
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: session.id },
      });

      res.json({ url: session.url });
    })
  );

  const subBody = z.object({
    planSlug: z.string().min(1),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
    interval: z.enum(['month', 'year']).default('month'),
  });

  router.post(
    '/subscription',
    requireDbUser,
    asyncHandler(async (req: RequestWithUser, res) => {
      if (!env.STRIPE_SECRET_KEY) {
        throw new HttpError(503, 'Stripe is not configured');
      }
      const user = req.dbUser!;
      const stripe = new Stripe(env.STRIPE_SECRET_KEY);
      const { planSlug, successUrl, cancelUrl, interval } = subBody.parse(req.body);

      const plan = await prisma.plan.findFirst({
        where: { slug: planSlug, active: true, isFree: false },
      });
      if (!plan) throw new HttpError(404, 'Plan not found');

      const priceId =
        interval === 'year' ? plan.stripePriceYearlyId : plan.stripePriceMonthlyId;
      if (!priceId) {
        throw new HttpError(503, 'Plan is missing Stripe price IDs');
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: user.email,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: user.id,
          planSlug: plan.slug,
        },
      });

      res.json({ url: session.url });
    })
  );

  return router;
}
