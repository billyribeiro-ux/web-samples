import type { APIRoute } from 'astro';
import type Stripe from 'stripe';

import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!stripe) {
    return new Response('Stripe not configured', { status: 501 });
  }
  const sig = request.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return new Response('Missing webhook secret', { status: 500 });
  }

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  const existing = await prisma.stripeEvent.findUnique({ where: { id: event.id } });
  if (existing?.processed) {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  await prisma.stripeEvent.upsert({
    where: { id: event.id },
    create: { id: event.id, type: event.type, processed: false },
    update: {},
  });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        const productId = session.metadata?.productId;
        if (session.mode === 'subscription' && userId && planId) {
          const subId = session.subscription as string;
          const exists = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: subId },
          });
          if (!exists) {
            await prisma.subscription.create({
              data: {
                userId,
                planId,
                stripeSubscriptionId: subId,
                stripeCustomerId: session.customer as string,
                status: 'ACTIVE',
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              },
            });
          }
        }
        if (session.mode === 'payment' && userId && productId) {
          const product = await prisma.product.findUnique({ where: { id: productId } });
          if (product) {
            const total = session.amount_total ?? product.price;
            await prisma.order.create({
              data: {
                userId,
                email: session.customer_details?.email ?? 'unknown@local',
                status: 'PAID',
                total,
                currency: session.currency ?? 'usd',
                stripeCheckoutSessionId: session.id,
                items: {
                  create: [
                    {
                      productId,
                      quantity: 1,
                      unitPrice: product.price,
                    },
                  ],
                },
              },
            });
          }
        }
        if (session.customer && typeof session.customer === 'string') {
          const uid = userId;
          if (uid) {
            await prisma.profile.upsert({
              where: { userId: uid },
              create: { userId: uid, stripeCustomerId: session.customer },
              update: { stripeCustomerId: session.customer },
            });
          }
        }
        break;
      }
      default:
        break;
    }

    await prisma.stripeEvent.update({
      where: { id: event.id },
      data: { processed: true },
    });
  } catch (e) {
    console.error('[stripe webhook]', e);
    return new Response('Handler error', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
};
