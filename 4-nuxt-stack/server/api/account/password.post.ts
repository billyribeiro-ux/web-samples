import { z } from 'zod'
import prisma from '../../utils/prisma'
import { requireUser } from '../../utils/auth'
import { hashPassword, verifyPassword } from '../../utils/password'
import { lucia } from '../../utils/lucia'

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
})

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = schema.parse(await readBody(event))
  const db = await prisma.user.findUnique({ where: { id: user.id } })
  if (!db?.passwordHash) throw createError({ statusCode: 400 })
  const ok = await verifyPassword(db.passwordHash, body.currentPassword)
  if (!ok) throw createError({ statusCode: 400, statusMessage: 'Invalid password' })
  const passwordHash = await hashPassword(body.newPassword)
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })
  await lucia.invalidateUserSessions(user.id)
  return { ok: true }
})
