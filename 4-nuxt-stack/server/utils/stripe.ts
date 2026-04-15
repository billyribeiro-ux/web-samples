import Stripe from 'stripe'

export function useStripe() {
  const config = useRuntimeConfig()
  if (!config.stripeSecretKey) {
    throw createError({ statusCode: 503, statusMessage: 'Stripe not configured' })
  }
  return new Stripe(config.stripeSecretKey)
}
