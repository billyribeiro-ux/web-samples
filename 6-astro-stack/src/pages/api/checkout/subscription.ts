import type { APIRoute } from 'astro';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { absoluteUrl } from '@/lib/site';
import { requireStripe, stripe } from '@/lib/stripe';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!stripe) {
    return new Response('Stripe not configured', { status: 501 });
  }
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return Response.redirect(new URL('/login?next=/pricing', request.url), 302);
  }

  const form = await request.formData();
  const planSlug = String(form.get('planSlug') ?? '');
  const interval = String(form.get('interval') ?? 'month');
  const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
  if (!plan || plan.slug === 'free') {
    return new Response('Invalid plan', { status: 400 });
  }

  const priceId =
    interval === 'year' ? plan.stripePriceYearlyId : plan.stripePriceMonthlyId;
  if (!priceId) {
    return new Response(
      'Configure STRIPE_PRICE_* or store Stripe Price IDs on the Plan row for this environment.',
      { status: 501 },
    );
  }

  const s = requireStripe();
  const checkout = await s.checkout.sessions.create({
    mode: 'subscription',
    customer_email: session.user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: absoluteUrl('/thank-you?session_id={CHECKOUT_SESSION_ID}'),
    cancel_url: absoluteUrl('/pricing'),
    metadata: {
      userId: session.user.id,
      planId: plan.id,
    },
  });

  if (!checkout.url) return new Response('No checkout URL', { status: 500 });
  return Response.redirect(checkout.url, 303);
};
