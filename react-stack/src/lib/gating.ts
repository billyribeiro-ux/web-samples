import { prisma } from "@/lib/db";
import { userHasActiveSubscription } from "@/lib/permissions";

export async function canAccessMembersRoute(userId: string) {
  const rule = await prisma.gatedContentRule.findFirst({
    where: { routePath: "/members" },
  });
  if (!rule?.requireActiveSubscription) return true;
  if (rule.planSlug) {
    const sub = await prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ["ACTIVE", "TRIALING"] },
        plan: { slug: rule.planSlug },
      },
    });
    return !!sub;
  }
  return userHasActiveSubscription(userId);
}
