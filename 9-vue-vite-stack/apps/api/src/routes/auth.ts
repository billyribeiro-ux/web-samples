import { Router } from "express";
import argon2 from "argon2";
import { randomBytes } from "crypto";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "shared";
import { HttpError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { createCsrfToken } from "../lib/csrf.js";
import { createUserSession, destroySession, readSessionCookie } from "../lib/session.js";
import { sendTransactionalEmail, resetLink, verificationLink } from "../services/email.js";
import { requireAuth } from "../middleware/requireAuth.js";

const HOURS = 3600000;

export const authRouter = Router();

authRouter.get("/csrf", (req, res) => {
  const session = req.sessionRecord;
  if (!session?.csrfSecret) {
    return res.json({ csrfToken: null });
  }
  res.json({ csrfToken: createCsrfToken(session.csrfSecret) });
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new HttpError(400, "Invalid input", "validation_error"));
    }
    const { email, password, name } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return next(new HttpError(409, "Email already registered"));
    }
    const passwordHash = await argon2.hash(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name ?? null,
        roles: {
          create: {
            role: { connect: { name: "CUSTOMER" } },
          },
        },
      },
    });

    const token = randomBytes(32).toString("hex");
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * HOURS),
      },
    });

    await sendTransactionalEmail(req.env, {
      to: user.email,
      subject: "Verify your email",
      html: `<p>Verify your account: <a href="${verificationLink(req.env.WEB_ORIGIN, token)}">click here</a></p>`,
    });

    const fullUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      include: {
        roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
      },
    });
    const { csrfSecret } = await createUserSession(req.env, res, user.id);
    const permissions = [
      ...new Set(
        fullUser.roles.flatMap((ur: { role: { permissions: { permission: { key: string } }[] } }) =>
          ur.role.permissions.map((p: { permission: { key: string } }) => p.permission.key)
        )
      ),
    ];
    res.status(201).json({
      user: {
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        emailVerified: fullUser.emailVerified,
        roles: fullUser.roles.map((r: { role: { name: string } }) => r.role.name),
        permissions,
      },
      csrfToken: createCsrfToken(csrfSecret),
    });
  } catch (e) {
    next(e);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return next(new HttpError(400, "Invalid input"));
    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
      },
    });
    if (!user) return next(new HttpError(401, "Invalid credentials"));
    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) return next(new HttpError(401, "Invalid credentials"));

    const existingCookie = readSessionCookie(req.env, req.cookies);
    if (existingCookie) {
      await prisma.session.deleteMany({ where: { token: existingCookie } });
    }

    const { csrfSecret } = await createUserSession(req.env, res, user.id);
    const permissions = [
      ...new Set(
        user.roles.flatMap((ur: { role: { permissions: { permission: { key: string } }[] } }) =>
          ur.role.permissions.map((p: { permission: { key: string } }) => p.permission.key)
        )
      ),
    ];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        roles: user.roles.map((r: { role: { name: string } }) => r.role.name),
        permissions,
      },
      csrfToken: createCsrfToken(csrfSecret),
    });
  } catch (e) {
    next(e);
  }
});

authRouter.post("/logout", async (req, res, next) => {
  try {
    const token = readSessionCookie(req.env, req.cookies);
    await destroySession(req.env, res, token);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

authRouter.post("/forgot-password", async (req, res, next) => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) return next(new HttpError(400, "Invalid input"));
    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.json({ ok: true });
    }
    const token = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 2 * HOURS),
      },
    });
    await sendTransactionalEmail(req.env, {
      to: user.email,
      subject: "Reset your password",
      html: `<p>Reset password: <a href="${resetLink(req.env.WEB_ORIGIN, token)}">click here</a></p>`,
    });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

authRouter.post("/reset-password", async (req, res, next) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) return next(new HttpError(400, "Invalid input"));
    const { token, password } = parsed.data;
    const row = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!row || row.expiresAt < new Date()) {
      return next(new HttpError(400, "Invalid or expired token"));
    }
    const passwordHash = await argon2.hash(password);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: row.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.delete({ where: { id: row.id } }),
      prisma.session.deleteMany({ where: { userId: row.userId } }),
    ]);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

authRouter.post("/verify-email", async (req, res, next) => {
  try {
    const parsed = verifyEmailSchema.safeParse(req.body);
    if (!parsed.success) return next(new HttpError(400, "Invalid input"));
    const row = await prisma.emailVerificationToken.findUnique({
      where: { token: parsed.data.token },
    });
    if (!row || row.expiresAt < new Date()) {
      return next(new HttpError(400, "Invalid or expired token"));
    }
    await prisma.$transaction([
      prisma.user.update({
        where: { id: row.userId },
        data: { emailVerified: true },
      }),
      prisma.emailVerificationToken.delete({ where: { id: row.id } }),
    ]);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = req.sessionRecord!.user;
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      notificationPrefs: user.notificationPrefs,
      roles: user.roles.map((r: { role: { name: string } }) => r.role.name),
      permissions: [
        ...new Set(
          user.roles.flatMap((ur: { role: { permissions: { permission: { key: string } }[] } }) =>
            ur.role.permissions.map((p: { permission: { key: string } }) => p.permission.key)
          )
        ),
      ],
    });
  } catch (e) {
    next(e);
  }
});
