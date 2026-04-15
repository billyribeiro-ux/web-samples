import { z } from 'zod'
import prisma from '../../utils/prisma'
import { requireUser } from '../../utils/auth'
import { useStripe } from '../../utils/stripe'

const schema = z.object({
  planSlug: z.string(),
  interval: z.enum(['month', 'year']),
})

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = schema.parse(await readBody(event))
  const plan = await prisma.plan.findUnique({ where: { slug: body.planSlug } })
  if (!plan) throw createError({ statusCode: 404 })

  const priceId =
    body.interval === 'year' ? plan.stripePriceYearlyId : plan.stripePriceMonthlyId
  if (!priceId) {
    throw createError({ statusCode: 503, statusMessage: 'Plan not linked to Stripe prices' })
  }

  const stripe = useStripe()
  const config = useRuntimeConfig()
  let dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  let customerId = dbUser?.stripeCustomerId
  if (!customerId) {
    const c = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    })
    customerId = c.id
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${config.public.siteUrl}/account/subscription?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.public.siteUrl}/pricing`,
    metadata: { userId: user.id, planId: plan.id },
  })

  return { url: session.url }
})
