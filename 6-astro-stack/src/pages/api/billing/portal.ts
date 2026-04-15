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
    return new Response('Unauthorized', { status: 401 });
  }

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile?.stripeCustomerId) {
    return new Response(
      'No Stripe customer yet — complete a Checkout session first.',
      { status: 400 },
    );
  }

  const s = requireStripe();
  const portal = await s.billingPortal.sessions.create({
    customer: profile.stripeCustomerId,
    return_url: absoluteUrl('/account/subscription'),
  });

  return Response.redirect(portal.url, 303);
};
