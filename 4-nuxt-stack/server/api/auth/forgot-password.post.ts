import prisma from '../../utils/prisma'
import { hashToken, generateToken } from '../../utils/auth'
import { sendTransactionalEmail } from '../../utils/email'
import { rateLimit, getClientIp } from '../../utils/rate-limit'
import { forgotPasswordSchema } from '../../../utils/schemas/auth'

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (!rateLimit(`forgot:${ip}`, 5, 60_000)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }

  const body = forgotPasswordSchema.parse(await readBody(event))
  const user = await prisma.user.findUnique({ where: { email: body.email } })
  if (user) {
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })
    const token = generateToken()
    const tokenHash = hashToken(token)
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    })
    const config = useRuntimeConfig()
    const url = `${config.public.siteUrl}/reset-password?token=${encodeURIComponent(token)}`
    await sendTransactionalEmail({
      to: user.email,
      subject: 'Reset your password',
      html: `<p>Reset your password: <a href="${url}">${url}</a></p>`,
    })
  }
  return { ok: true }
})
