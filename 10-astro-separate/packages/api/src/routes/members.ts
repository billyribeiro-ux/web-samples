import { Hono } from "hono";
import { SessionScope, SubscriptionStatus } from "@repo/db";
import { prisma } from "@repo/db";
import { ApiError } from "../lib/errors.js";
import { loadSession } from "../middleware/session.js";
import { requireMember } from "../middleware/guards.js";
import type { AppEnv } from "../types.js";

export const membersRoutes = new Hono<AppEnv>();
membersRoutes.use("*", loadSession(SessionScope.MEMBER));
membersRoutes.use("*", requireMember());

membersRoutes.get("/:path{.+}", async (c) => {
  const slug = c.req.param("path");
  const rule = await prisma.gatedContentRule.findUnique({ where: { slug } });
  if (!rule) throw new ApiError(404, "Not found", "NOT_FOUND");

  const u = c.get("authUser")!;
  const activeSub = await prisma.subscription.findFirst({
    where: {
      userId: u.id,
      status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
    },
    include: { plan: true },
  });

  if (rule.requiresSubscription && !activeSub) {
    throw new ApiError(403, "Subscription required", "GATED");
  }

  if (rule.minPlanSlug && rule.minPlanSlug !== "free") {
    const minPlan = await prisma.plan.findUnique({ where: { slug: rule.minPlanSlug } });
    if (minPlan && activeSub && activeSub.plan.slug === "free") {
      throw new ApiError(403, "Upgrade required", "GATED_PLAN");
    }
  }

  return c.json({ rule });
});
