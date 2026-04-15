import Stripe from "stripe";
import type { Env } from "../lib/env.js";

export function getStripe(env: Env): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  return new Stripe(env.STRIPE_SECRET_KEY, { typescript: true });
}
