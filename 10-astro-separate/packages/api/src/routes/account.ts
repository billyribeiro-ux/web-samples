import { Hono } from "hono";
import { z } from "zod";
import { SessionScope } from "@repo/db";
import { prisma } from "@repo/db";
import { ApiError } from "../lib/errors.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { requireMember } from "../middleware/guards.js";
import type { AppEnv } from "../types.js";

export const accountRoutes = new Hono<AppEnv>()
  .get("/me", requireMember(), async (c) => {
    const u = c.get("authUser")!;
    const full = await prisma.user.findUnique({
      where: { id: u.id },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerifiedAt: true,
        stripeCustomerId: true,
        subscriptions: { include: { plan: true } },
        notificationPreference: true,
      },
    });
    return c.json({ user: full });
  })
  .patch("/profile", requireMember(), async (c) => {
    const u = c.get("authUser")!;
    const body = z
      .object({
        name: z.string().min(1).max(120).optional(),
        marketingEmail: z.boolean().optional(),
        productUpdates: z.boolean().optional(),
      })
      .parse(await c.req.json());
    await prisma.$transaction([
      prisma.user.update({
        where: { id: u.id },
        data: {
          ...(body.name !== undefined ? { name: body.name } : {}),
        },
      }),
      prisma.notificationPreference.upsert({
        where: { userId: u.id },
        update: {
          ...(body.marketingEmail !== undefined ? { marketingEmail: body.marketingEmail } : {}),
          ...(body.productUpdates !== undefined ? { productUpdates: body.productUpdates } : {}),
        },
        create: {
          userId: u.id,
          marketingEmail: body.marketingEmail ?? true,
          productUpdates: body.productUpdates ?? true,
        },
      }),
    ]);
    return c.json({ ok: true });
  })
  .post("/password", requireMember(), async (c) => {
    const u = c.get("authUser")!;
    const body = z
      .object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) })
      .parse(await c.req.json());
    const user = await prisma.user.findUnique({ where: { id: u.id } });
    if (!user || !(await verifyPassword(user.passwordHash, body.currentPassword))) {
      throw new ApiError(400, "Current password incorrect", "BAD_PASSWORD");
    }
    await prisma.user.update({
      where: { id: u.id },
      data: { passwordHash: await hashPassword(body.newPassword) },
    });
    await prisma.session.deleteMany({ where: { userId: u.id, scope: SessionScope.MEMBER } });
    return c.json({ ok: true, message: "Please sign in again" });
  })
  .get("/orders", requireMember(), async (c) => {
    const u = c.get("authUser")!;
    const orders = await prisma.order.findMany({
      where: { userId: u.id },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } } },
    });
    return c.json({ orders });
  })
  .get("/favorites", requireMember(), async (c) => {
    const u = c.get("authUser")!;
    const favorites = await prisma.favorite.findMany({
      where: { userId: u.id },
      include: { post: true, product: true },
    });
    return c.json({ favorites });
  });
