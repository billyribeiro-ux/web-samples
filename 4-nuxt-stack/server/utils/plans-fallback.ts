/**
 * Shown when the database has no plans or Prisma is unavailable so marketing pages still render.
 * Checkout still requires matching rows in `Plan` (run `npx prisma db seed`) and Stripe price IDs.
 */
export const FALLBACK_PLANS = [
  {
    id: 'fallback-starter',
    name: 'Starter',
    slug: 'starter',
    description: 'For individuals and small projects getting started.',
    priceMonthlyCents: 1900,
    priceYearlyCents: 19000,
    currency: 'usd',
    stripePriceMonthlyId: null as string | null,
    stripePriceYearlyId: null as string | null,
    features: ['Core platform access', 'Blog & SEO tools', 'Email support'],
    highlighted: false,
  },
  {
    id: 'fallback-pro',
    name: 'Pro',
    slug: 'pro',
    description: 'For growing teams that need memberships and priority support.',
    priceMonthlyCents: 4900,
    priceYearlyCents: 49000,
    currency: 'usd',
    stripePriceMonthlyId: null as string | null,
    stripePriceYearlyId: null as string | null,
    features: ['Everything in Starter', 'Member areas & subscriptions', 'Priority support'],
    highlighted: true,
  },
] as const
