import { z } from 'zod'
import prisma from '../../utils/prisma'
import { rateLimit, getClientIp } from '../../utils/rate-limit'

const schema = z.object({
  email: z.string().email(),
  hp: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (!rateLimit(`newsletter:${ip}`, 5, 60_000)) {
    throw createError({ statusCode: 429 })
  }
  const body = schema.parse(await readBody(event))
  if (body.hp) throw createError({ statusCode: 400 })
  await prisma.newsletterLead.upsert({
    where: { email: body.email },
    create: { email: body.email, source: 'footer' },
    update: {},
  })
  await prisma.formSubmission.create({
    data: {
      type: 'NEWSLETTER',
      payload: { email: body.email },
      ip,
    },
  })
  return { ok: true }
})
