import { appendHeader } from 'h3'
import prisma from '../../utils/prisma'
import { lucia } from '../../utils/lucia'
import { hashPassword } from '../../utils/password'
import { hashToken, generateToken } from '../../utils/auth'
import { sendTransactionalEmail } from '../../utils/email'
import { rateLimit, getClientIp } from '../../utils/rate-limit'
import { registerSchema } from '../../../utils/schemas/auth'

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (!rateLimit(`register:${ip}`, 5, 60_000)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }

  const body = registerSchema.parse(await readBody(event))
  const existing = await prisma.user.findUnique({ where: { email: body.email } })
  if (existing) {
    throw createError({ statusCode: 400, statusMessage: 'Email already registered' })
  }

  const passwordHash = await hashPassword(body.password)
  const user = await prisma.user.create({
    data: {
      email: body.email,
      passwordHash,
      name: body.name ?? null,
      roles: {
        create: {
          role: {
            connect: { slug: 'member' },
          },
        },
      },
    },
  })

  const token = generateToken()
  const tokenHash = hashToken(token)
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  })

  const config = useRuntimeConfig()
  const verifyUrl = `${config.public.siteUrl}/verify-email?token=${encodeURIComponent(token)}`
  await sendTransactionalEmail({
    to: user.email,
    subject: 'Verify your email',
    html: `<p>Hi${user.name ? ` ${user.name}` : ''},</p><p><a href="${verifyUrl}">Verify your email</a></p>`,
  })

  const session = await lucia.createSession(user.id, {})
  appendHeader(event, 'Set-Cookie', lucia.createSessionCookie(session.id).serialize())

  return { ok: true, userId: user.id }
})
