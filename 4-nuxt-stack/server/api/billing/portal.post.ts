import prisma from '../../utils/prisma'
import { requireUser } from '../../utils/auth'
import { useStripe } from '../../utils/stripe'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const stripe = useStripe()
  const config = useRuntimeConfig()
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser?.stripeCustomerId) {
    throw createError({ statusCode: 400, statusMessage: 'No billing account' })
  }
  const portal = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${config.public.siteUrl}/account/subscription`,
  })
  return { url: portal.url }
})
