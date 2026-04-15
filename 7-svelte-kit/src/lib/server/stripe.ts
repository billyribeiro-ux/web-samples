import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
	const key = env.STRIPE_SECRET_KEY;
	if (!key) {
		throw new Error('STRIPE_SECRET_KEY is not set');
	}
	stripe ??= new Stripe(key, { apiVersion: '2026-03-25.dahlia' });
	return stripe;
}

export function stripeConfigured(): boolean {
	return Boolean(env.STRIPE_SECRET_KEY);
}
