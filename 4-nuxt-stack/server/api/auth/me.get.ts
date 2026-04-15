import prisma from '../../utils/prisma'
import { getSessionUser, getUserRoles } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const { user } = await getSessionUser(event)
  if (!user) {
    return { user: null }
  }
  const db = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, name: true, emailVerified: true, imageUrl: true },
  })
  const roles = await getUserRoles(user.id)
  return {
    user: db,
    roles: roles.map((r) => ({ slug: r.slug, name: r.name })),
  }
})
