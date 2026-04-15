import { appendHeader } from 'h3'
import prisma from '../../utils/prisma'
import { lucia } from '../../utils/lucia'
import { verifyPassword } from '../../utils/password'
import { rateLimit, getClientIp } from '../../utils/rate-limit'
import { loginSchema } from '../../../utils/schemas/auth'

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (!rateLimit(`login:${ip}`, 20, 60_000)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }

  const body = loginSchema.parse(await readBody(event))
  const user = await prisma.user.findUnique({ where: { email: body.email } })
  if (!user?.passwordHash) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid credentials' })
  }
  const valid = await verifyPassword(user.passwordHash, body.password)
  if (!valid) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid credentials' })
  }

  await lucia.invalidateUserSessions(user.id)
  const session = await lucia.createSession(user.id, {})
  appendHeader(event, 'Set-Cookie', lucia.createSessionCookie(session.id).serialize())

  return { ok: true, userId: user.id }
})
