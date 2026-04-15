import prisma from '../../utils/prisma'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const items = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { items: true, user: true },
  })
  return { items }
})
