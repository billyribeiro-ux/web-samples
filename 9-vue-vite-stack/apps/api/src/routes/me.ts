import { Router } from "express";
import type { Prisma } from "@prisma/client";
import argon2 from "argon2";
import { changePasswordSchema, updateProfileSchema } from "shared";
import { HttpError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { destroySession, readSessionCookie } from "../lib/session.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const meRouter = Router();

meRouter.put("/profile", requireAuth, async (req, res, next) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) return next(new HttpError(400, "Invalid input"));
    const userId = req.sessionRecord!.user.id;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: parsed.data.name === undefined ? undefined : parsed.data.name,
        notificationPrefs:
          parsed.data.notificationPrefs === undefined
            ? undefined
            : (parsed.data.notificationPrefs as Prisma.InputJsonValue),
      },
    });
    res.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      emailVerified: updated.emailVerified,
      notificationPrefs: updated.notificationPrefs,
    });
  } catch (e) {
    next(e);
  }
});

meRouter.put("/password", requireAuth, async (req, res, next) => {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) return next(new HttpError(400, "Invalid input"));
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.sessionRecord!.user.id },
    });
    const ok = await argon2.verify(user.passwordHash, parsed.data.currentPassword);
    if (!ok) return next(new HttpError(400, "Current password incorrect"));
    const passwordHash = await argon2.hash(parsed.data.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    await prisma.session.deleteMany({ where: { userId: user.id } });
    const token = readSessionCookie(req.env, req.cookies);
    await destroySession(req.env, res, token);
    res.json({ ok: true, message: "Password updated. Please sign in again." });
  } catch (e) {
    next(e);
  }
});
