import prisma from '../../utils/prisma'
import { requireUser, userHasRoleSlug } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  if (
    (await userHasRoleSlug(user.id, 'super_admin')) ||
    (await userHasRoleSlug(user.id, 'admin'))
  ) {
    return { ok: true }
  }
  const rule = await prisma.gatedContentRule.findFirst({
    where: { resourceId: '/members' },
  })
  if (!rule?.minPlanSlug) return { ok: true }
  const sub = await prisma.subscription.findFirst({
    where: { userId: user.id, status: { in: ['active', 'trialing'] } },
    include: { plan: true },
  })
  if (!sub || sub.plan.slug !== rule.minPlanSlug) {
    return { ok: false, needPlan: rule.minPlanSlug }
  }
  return { ok: true }
})
