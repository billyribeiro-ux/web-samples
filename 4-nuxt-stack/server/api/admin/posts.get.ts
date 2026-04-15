import prisma from '../../utils/prisma'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const items = await prisma.post.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 100,
    include: { author: true },
  })
  return { items }
})
