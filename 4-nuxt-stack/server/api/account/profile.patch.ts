import { z } from 'zod'
import prisma from '../../utils/prisma'
import { requireUser } from '../../utils/auth'

const schema = z.object({
  name: z.string().min(1).max(120).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = schema.parse(await readBody(event))
  await prisma.user.update({
    where: { id: user.id },
    data: { name: body.name },
  })
  return { ok: true }
})
