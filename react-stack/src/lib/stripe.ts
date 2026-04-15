import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    })
  : null;

export function requireStripe() {
  if (!stripe) {
    throw new Error("Stripe is not configured (STRIPE_SECRET_KEY)");
  }
  return stripe;
}
