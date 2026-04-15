import { Router } from "express";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  profileUpdateSchema,
  registerSchema,
  resetPasswordSchema,
} from "@platform/shared";
import { prisma } from "../lib/prisma.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { hashToken, randomToken } from "../lib/tokens.js";
import { createMailer } from "../lib/email.js";
import type { Env } from "../config.js";
import { requireUser } from "../middleware/auth.js";

export function authRouter(env: Env) {
  const r = Router();
  const mail = createMailer(env);

  r.get("/csrf", (req, res) => {
    if (!req.session.csrfToken) req.session.csrfToken = randomToken(24);
    res.json({ csrfToken: req.session.csrfToken });
  });

  r.post("/register", async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const { email, password, name } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name ?? null,
        roles: {
          create: {
            role: { connect: { slug: "member" } },
          },
        },
      },
    });
    const raw = randomToken(32);
    await prisma.emailVerificationToken.create({
      data: {
        tokenHash: hashToken(raw),
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
    const link = `${env.APP_URL}/verify-email?token=${raw}`;
    await mail.sendVerification(user.email, link);
    res.status(201).json({ id: user.id, email: user.email });
  });

  r.post("/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user?.passwordHash) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    req.session.userId = user.id;
    res.json({ id: user.id, email: user.email, emailVerified: user.emailVerified });
  });

  r.post("/logout", (req, res) => {
    req.session.destroy(() => {
      res.status(204).send();
    });
  });

  r.get("/me", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      res.json({ user: null });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: true } },
        subscriptions: {
          where: { status: { in: ["ACTIVE", "TRIALING"] } },
          include: { plan: true },
          take: 1,
        },
      },
    });
    if (!user) {
      res.json({ user: null });
      return;
    }
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        roles: user.roles.map((x) => x.role.slug),
        subscription: user.subscriptions[0] ?? null,
      },
    });
  });

  r.post("/forgot-password", async (req, res) => {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const raw = randomToken(32);
      await prisma.passwordResetToken.create({
        data: {
          tokenHash: hashToken(raw),
          userId: user.id,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        },
      });
      const link = `${env.APP_URL}/reset-password?token=${raw}`;
      await mail.sendPasswordReset(email, link);
    }
    res.json({ ok: true });
  });

  r.post("/reset-password", async (req, res) => {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const { token, password } = parsed.data;
    const row = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
    });
    if (!row || row.expiresAt < new Date()) {
      res.status(400).json({ error: "Invalid or expired token" });
      return;
    }
    const passwordHash = await hashPassword(password);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: row.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.delete({ where: { id: row.id } }),
    ]);
    res.json({ ok: true });
  });

  r.get("/verify-email", async (req, res) => {
    const token = typeof req.query.token === "string" ? req.query.token : "";
    if (!token) {
      res.status(400).json({ error: "Missing token" });
      return;
    }
    const row = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash: hashToken(token) },
    });
    if (!row || row.expiresAt < new Date()) {
      res.status(400).json({ error: "Invalid or expired token" });
      return;
    }
    await prisma.$transaction([
      prisma.user.update({
        where: { id: row.userId },
        data: { emailVerified: true },
      }),
      prisma.emailVerificationToken.delete({ where: { id: row.id } }),
    ]);
    res.json({ ok: true });
  });

  r.patch("/profile", requireUser, async (req, res) => {
    const parsed = profileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const userId = req.session.userId!;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name: parsed.data.name ?? undefined },
    });
    res.json({ id: user.id, name: user.name, email: user.email });
  });

  r.post("/change-password", requireUser, async (req, res) => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const userId = req.session.userId!;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) {
      res.status(400).json({ error: "No password set" });
      return;
    }
    const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!ok) {
      res.status(400).json({ error: "Current password incorrect" });
      return;
    }
    const passwordHash = await hashPassword(parsed.data.newPassword);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    res.json({ ok: true });
  });

  return r;
}
