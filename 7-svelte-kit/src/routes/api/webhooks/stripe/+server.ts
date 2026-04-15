import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { clearCart } from '$lib/server/cart';
import { trackServerEvent } from '$lib/server/analytics';
import { db } from '$lib/server/db';
import { order, subscription, user } from '$lib/server/db/schema';
import { getStripe } from '$lib/server/stripe';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const secret = env.STRIPE_WEBHOOK_SECRET;
	if (!secret) throw error(503, 'Webhook not configured');

	const signature = request.headers.get('stripe-signature');
	if (!signature) throw error(400, 'Missing signature');

	const raw = await request.text();
	const stripe = getStripe();

	let evt;
	try {
		evt = stripe.webhooks.constructEvent(raw, signature, secret);
	} catch {
		throw error(400, 'Invalid signature');
	}

	if (evt.type === 'checkout.session.completed') {
		const session = evt.data.object as import('stripe').Stripe.Checkout.Session;
		const orderId = session.metadata?.orderId;
		const cartId = session.metadata?.cartId;
		if (orderId) {
			await db
				.update(order)
				.set({
					status: 'paid',
					stripePaymentIntentId:
						typeof session.payment_intent === 'string'
							? session.payment_intent
							: (session.payment_intent?.id ?? null),
					updatedAt: new Date()
				})
				.where(eq(order.id, orderId));
		}
		if (cartId) await clearCart(cartId);
		await trackServerEvent('purchase_completed', { orderId, sessionId: session.id });
	}

	if (evt.type === 'customer.subscription.updated' || evt.type === 'customer.subscription.deleted') {
		const sub = evt.data.object as import('stripe').Stripe.Subscription;
		const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
		if (!customerId) return new Response('ok');

		const [u] = await db.select().from(user).where(eq(user.stripeCustomerId, customerId)).limit(1);
		if (!u) return new Response('ok');

		const [existing] = await db
			.select()
			.from(subscription)
			.where(eq(subscription.stripeSubscriptionId, sub.id))
			.limit(1);

		const status =
			sub.status === 'active' || sub.status === 'trialing'
				? sub.status
				: sub.status === 'canceled'
					? 'canceled'
					: 'inactive';

		const cpe = (sub as { current_period_end?: number }).current_period_end;
		const end = cpe ? new Date(cpe * 1000) : null;

		if (existing) {
			await db
				.update(subscription)
				.set({
					status,
					currentPeriodEnd: end,
					cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
					updatedAt: new Date()
				})
				.where(eq(subscription.id, existing.id));
		}
	}

	return new Response('ok', { status: 200 });
};
