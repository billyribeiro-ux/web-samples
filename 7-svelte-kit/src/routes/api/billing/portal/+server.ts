import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { requireLogin } from '$lib/server/rbac/guards';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { getStripe, stripeConfigured } from '$lib/server/stripe';
import { env as publicEnv } from '$env/dynamic/public';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	const u = requireLogin(event);
	if (!stripeConfigured()) throw error(503, 'Billing not configured');

	const [row] = await db.select().from(user).where(eq(user.id, u.id)).limit(1);
	if (!row?.stripeCustomerId) {
		throw redirect(303, '/pricing');
	}

	const origin = (publicEnv.PUBLIC_APP_URL ?? 'http://localhost:5173').replace(/\/$/, '');
	const stripe = getStripe();
	const session = await stripe.billingPortal.sessions.create({
		customer: row.stripeCustomerId,
		return_url: `${origin}/account/subscription`
	});

	throw redirect(303, session.url);
};
