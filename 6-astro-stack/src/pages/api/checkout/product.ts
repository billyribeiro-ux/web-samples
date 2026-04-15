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
    return Response.redirect(new URL('/login?next=/products', request.url), 302);
  }

  const form = await request.formData();
  const productId = String(form.get('productId') ?? '');
  const product = await prisma.product.findFirst({ where: { id: productId, isActive: true } });
  if (!product?.stripePriceId) {
    return new Response(
      'Product missing stripePriceId — set after syncing Stripe Prices.',
      { status: 501 },
    );
  }

  const s = requireStripe();
  const checkout = await s.checkout.sessions.create({
    mode: 'payment',
    customer_email: session.user.email,
    line_items: [{ price: product.stripePriceId, quantity: 1 }],
    success_url: absoluteUrl('/thank-you?session_id={CHECKOUT_SESSION_ID}'),
    cancel_url: absoluteUrl(`/products/${product.slug}`),
    metadata: {
      userId: session.user.id,
      productId: product.id,
    },
  });

  if (!checkout.url) return new Response('No checkout URL', { status: 500 });
  return Response.redirect(checkout.url, 303);
};
