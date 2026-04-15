import prisma from '../../utils/prisma'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const [users, posts, orders, leads] = await prisma.$transaction([
    prisma.user.count(),
    prisma.post.count(),
    prisma.order.count(),
    prisma.formSubmission.count(),
  ])
  return { counts: { users, posts, orders, leads } }
})
