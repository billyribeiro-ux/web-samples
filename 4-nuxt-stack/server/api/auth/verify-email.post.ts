import prisma from '../../utils/prisma'
import { hashToken } from '../../utils/auth'
import { z } from 'zod'

const schema = z.object({ token: z.string().min(10) })

export default defineEventHandler(async (event) => {
  const body = schema.parse(await readBody(event))
  const tokenHash = hashToken(body.token)
  const row = await prisma.emailVerificationToken.findFirst({
    where: { tokenHash, expiresAt: { gt: new Date() } },
  })
  if (!row) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or expired token' })
  }
  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { emailVerified: true },
    }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: row.userId } }),
  ])
  return { ok: true }
})
