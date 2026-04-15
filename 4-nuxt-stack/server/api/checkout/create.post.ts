import { z } from 'zod'
import prisma from '../../utils/prisma'
import { useStripe } from '../../utils/stripe'
import { getSessionUser } from '../../utils/auth'

const bodySchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number().min(1) })).min(1),
  email: z.string().email().optional(),
  successPath: z.string().optional(),
  cancelPath: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const body = bodySchema.parse(await readBody(event))
  const stripe = useStripe()
  const config = useRuntimeConfig()
  const { user } = await getSessionUser(event)
  const email = user?.email ?? body.email
  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Email required for checkout' })
  }

  const products = await prisma.product.findMany({
    where: { id: { in: body.items.map((i) => i.productId) }, active: true },
  })
  if (products.length !== body.items.length) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid products' })
  }

  let customerId = user ? (await prisma.user.findUnique({ where: { id: user.id } }))?.stripeCustomerId : undefined
  if (user && !customerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { userId: user.id },
    })
    customerId = customer.id
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    })
  }

  const lineItems = body.items.map((item) => {
    const p = products.find((x) => x.id === item.productId)!
    return {
      price_data: {
        currency: p.currency,
        unit_amount: p.priceCents,
        product_data: { name: p.name },
      },
      quantity: item.quantity,
    }
  })

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    customer_email: customerId ? undefined : email,
    line_items: lineItems,
    success_url: `${config.public.siteUrl}${body.successPath || '/thank-you'}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.public.siteUrl}${body.cancelPath || '/cart'}`,
    metadata: { userId: user?.id ?? '' },
  })

  const total = body.items.reduce((sum, i) => {
    const p = products.find((x) => x.id === i.productId)!
    return sum + p.priceCents * i.quantity
  }, 0)

  await prisma.order.create({
    data: {
      userId: user?.id,
      email,
      status: 'PENDING',
      totalCents: total,
      currency: products[0]?.currency ?? 'usd',
      stripeSessionId: session.id,
      items: {
        create: body.items.map((i) => {
          const p = products.find((x) => x.id === i.productId)!
          return {
            productId: p.id,
            quantity: i.quantity,
            unitCents: p.priceCents,
          }
        }),
      },
    },
  })

  return { url: session.url }
})
