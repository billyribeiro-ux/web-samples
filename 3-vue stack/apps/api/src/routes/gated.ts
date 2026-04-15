import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { SubscriptionStatus } from "@prisma/client";

export function gatedRouter() {
  const r = Router();

  /** Returns whether current session may access a members path */
  r.get("/check", async (req, res) => {
    const path = typeof req.query.path === "string" ? req.query.path : "/members";
    const rule = await prisma.gatedContentRule.findUnique({ where: { path } });
    if (!rule || !rule.requireSubscription) {
      res.json({ allowed: true });
      return;
    }
    const userId = req.session.userId;
    if (!userId) {
      res.json({ allowed: false, reason: "auth" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });
    if (user?.roles.some((r) => r.role.slug === "super-admin")) {
      res.json({ allowed: true });
      return;
    }
    const sub = await prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
      },
      include: { plan: true },
    });
    if (!sub) {
      res.json({ allowed: false, reason: "subscription" });
      return;
    }
    if (rule.minPlanSlug && sub.plan.slug !== rule.minPlanSlug) {
      res.json({ allowed: false, reason: "plan" });
      return;
    }
    res.json({ allowed: true });
  });

  return r;
}
