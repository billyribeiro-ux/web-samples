import prisma from '../../utils/prisma'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const sub = await prisma.subscription.findFirst({
    where: { userId: user.id },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  })
  return { subscription: sub }
})
