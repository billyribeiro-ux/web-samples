import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { getCartLines, getOrCreateCartId } from '$lib/server/cart';
import { getStripe, stripeConfigured } from '$lib/server/stripe';
import { db } from '$lib/server/db';
import { order, orderItem } from '$lib/server/db/schema';
import { nanoid } from 'nanoid';
import { env as publicEnv } from '$env/dynamic/public';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, locals }) => {
	const cartId = await getOrCreateCartId(cookies, locals.user?.id ?? null);
	const lines = await getCartLines(cartId);
	const totalCents = lines.reduce((s, l) => s + l.product.priceCents * l.quantity, 0);
	return { lines, totalCents };
};

export const actions: Actions = {
	checkout: async (event) => {
		if (!stripeConfigured()) return fail(503, { message: 'Payments not configured' });
		if (!event.locals.user?.email) {
			throw redirect(302, '/login?next=/cart');
		}

		const cartId = await getOrCreateCartId(event.cookies, event.locals.user?.id ?? null);
		const lines = await getCartLines(cartId);
		if (lines.length === 0) return fail(400, { message: 'Cart is empty' });

		const origin = (publicEnv.PUBLIC_APP_URL ?? 'http://localhost:5173').replace(/\/$/, '');
		const stripe = getStripe();

		const orderId = nanoid();
		const totalCents = lines.reduce((s, l) => s + l.product.priceCents * l.quantity, 0);
		const currency = lines[0].product.currency;

		await db.insert(order).values({
			id: orderId,
			userId: event.locals.user!.id,
			email: event.locals.user!.email,
			status: 'pending',
			totalCents,
			currency
		});

		for (const line of lines) {
			await db.insert(orderItem).values({
				id: nanoid(),
				orderId,
				productId: line.product.id,
				quantity: line.quantity,
				unitPriceCents: line.product.priceCents
			});
		}

		const session = await stripe.checkout.sessions.create({
			mode: 'payment',
			line_items: lines.map((l) => ({
				price_data: {
					currency,
					product_data: { name: l.product.name },
					unit_amount: l.product.priceCents
				},
				quantity: l.quantity
			})),
			success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${origin}/cart`,
			customer_email: event.locals.user?.email ?? undefined,
			metadata: { orderId, cartId }
		});

		await db
			.update(order)
			.set({ stripeCheckoutSessionId: session.id })
			.where(eq(order.id, orderId));

		throw redirect(303, session.url!);
	}
};
