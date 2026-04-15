import { z } from 'zod'
import prisma from '../../utils/prisma'
import { rateLimit, getClientIp } from '../../utils/rate-limit'

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().min(10).max(5000),
  website: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (!rateLimit(`contact:${ip}`, 10, 60_000)) {
    throw createError({ statusCode: 429 })
  }
  const body = schema.parse(await readBody(event))
  if (body.website) {
    throw createError({ statusCode: 400 })
  }
  await prisma.formSubmission.create({
    data: {
      type: 'CONTACT',
      payload: { name: body.name, email: body.email, message: body.message },
      ip,
      userAgent: getHeader(event, 'user-agent') ?? '',
    },
  })
  return { ok: true }
})
