import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;

export const stripe = key
  ? new Stripe(key, {
      typescript: true,
    })
  : null;

export function requireStripe(): Stripe {
  if (!stripe) throw new Error('STRIPE_SECRET_KEY is not configured');
  return stripe;
}
