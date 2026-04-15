import Stripe from "stripe";

/** Pinned to the Stripe Node SDK default API version. */
const API_VERSION = "2026-03-25.dahlia" as const;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(key, { apiVersion: API_VERSION });
}
