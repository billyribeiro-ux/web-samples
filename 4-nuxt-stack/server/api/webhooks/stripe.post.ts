import prisma from '../../utils/prisma'
import { useStripe } from '../../utils/stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const raw = await readRawBody(event)
  if (!raw) throw createError({ statusCode: 400 })
  const sig = getHeader(event, 'stripe-signature')
  if (!config.stripeWebhookSecret || !sig) {
    throw createError({ statusCode: 400 })
  }

  const stripe = useStripe()
  let stripeEvent
  try {
    stripeEvent = stripe.webhooks.constructEvent(raw, sig, config.stripeWebhookSecret)
  } catch {
    throw createError({ statusCode: 400 })
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object as { id: string; payment_intent?: string | null }
    await prisma.order.updateMany({
      where: { stripeSessionId: session.id },
      data: { status: 'PAID', stripePaymentId: session.payment_intent ?? undefined },
    })
  }

  if (stripeEvent.type === 'customer.subscription.updated' || stripeEvent.type === 'customer.subscription.deleted') {
    const sub = stripeEvent.data.object as { id: string; status: string; customer: string; current_period_end: number }
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: sub.id },
      data: {
        status: mapStripeSubStatus(sub.status),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
      },
    })
  }

  return { received: true }
})

function mapStripeSubStatus(s: string) {
  const allowed = ['trialing', 'active', 'past_due', 'canceled', 'incomplete', 'unpaid'] as const
  if (allowed.includes(s as (typeof allowed)[number])) return s as (typeof allowed)[number]
  return 'incomplete'
}
