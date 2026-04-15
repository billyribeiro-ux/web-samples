import prisma from '../../utils/prisma'
import { hashToken } from '../../utils/auth'
import { hashPassword } from '../../utils/password'
import { resetPasswordSchema } from '../../../utils/schemas/auth'

export default defineEventHandler(async (event) => {
  const body = resetPasswordSchema.parse(await readBody(event))
  const tokenHash = hashToken(body.token)
  const row = await prisma.passwordResetToken.findFirst({
    where: { tokenHash, expiresAt: { gt: new Date() } },
  })
  if (!row) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or expired token' })
  }
  const passwordHash = await hashPassword(body.password)
  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.deleteMany({ where: { userId: row.userId } }),
    prisma.session.deleteMany({ where: { userId: row.userId } }),
  ])
  return { ok: true }
})
