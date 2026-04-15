import type { Request, Response } from 'express';
import Stripe from 'stripe';
import type { Env } from '../../lib/env.js';
import { prisma } from '../../lib/prisma.js';
import { asyncHandler, HttpError } from '../../middleware/errors.js';

export function createStripeWebhookHandler(env: Env) {
  return asyncHandler(async (req: Request, res: Response) => {
    const secret = env.STRIPE_WEBHOOK_SECRET;
    const key = env.STRIPE_SECRET_KEY;
    if (!secret || !key) {
      throw new HttpError(503, 'Stripe webhooks not configured');
    }

    const stripe = new Stripe(key);
    const sig = req.headers['stripe-signature'];
    if (!sig || !(req.body instanceof Buffer)) {
      throw new HttpError(400, 'Missing stripe signature or body');
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, secret);
    } catch {
      throw new HttpError(400, 'Invalid Stripe signature');
    }

    const existing = await prisma.stripeWebhookEvent.findUnique({
      where: { eventId: event.id },
    });
    if (existing) {
      return res.json({ received: true, duplicate: true });
    }

    await prisma.stripeWebhookEvent.create({
      data: { eventId: event.id, type: event.type, processed: false },
    });

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          const orderId = session.metadata?.orderId;
          if (orderId) {
            await prisma.order.updateMany({
              where: { id: orderId, status: 'PENDING' },
              data: {
                status: 'PAID',
                stripePaymentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
              },
            });
          }
          const uid = session.metadata?.userId?.trim();
          if (uid && session.mode === 'subscription' && session.subscription) {
            const subId =
              typeof session.subscription === 'string'
                ? session.subscription
                : session.subscription.id;
            const stripeSub = (await stripe.subscriptions.retrieve(
              subId
            )) as unknown as Stripe.Subscription & {
              current_period_end: number;
            };
            const planSlug = session.metadata?.planSlug;
            if (planSlug) {
              const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
              if (plan) {
                await prisma.subscription.upsert({
                  where: { stripeSubscriptionId: subId },
                  create: {
                    userId: uid,
                    planId: plan.id,
                    stripeCustomerId: String(session.customer),
                    stripeSubscriptionId: subId,
                    status: mapStripeSubStatus(stripeSub.status),
                    currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
                  },
                  update: {
                    status: mapStripeSubStatus(stripeSub.status),
                    currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
                  },
                });
              }
            }
          }
          break;
        }
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const sub = event.data.object as Stripe.Subscription & {
            current_period_end: number;
            cancel_at_period_end: boolean;
          };
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: sub.id },
            data: {
              status: mapStripeSubStatus(sub.status),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
              cancelAtPeriodEnd: sub.cancel_at_period_end,
            },
          });
          break;
        }
        default:
          break;
      }

      await prisma.stripeWebhookEvent.update({
        where: { eventId: event.id },
        data: { processed: true },
      });
    } catch (e) {
      console.error('Stripe webhook handler error', e);
      await prisma.stripeWebhookEvent.update({
        where: { eventId: event.id },
        data: { processed: false },
      });
    }

    res.json({ received: true });
  });
}

function mapStripeSubStatus(
  status: Stripe.Subscription.Status
): 'NONE' | 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' {
  switch (status) {
    case 'trialing':
      return 'TRIALING';
    case 'active':
      return 'ACTIVE';
    case 'past_due':
      return 'PAST_DUE';
    case 'canceled':
    case 'unpaid':
      return 'CANCELED';
    case 'incomplete':
    case 'incomplete_expired':
      return 'INCOMPLETE';
    default:
      return 'NONE';
  }
}
