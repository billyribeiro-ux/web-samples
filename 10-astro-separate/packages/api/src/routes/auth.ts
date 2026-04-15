import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { z } from "zod";
import { SessionScope } from "@repo/db";
import { prisma } from "@repo/db";
import { ApiError } from "../lib/errors.js";
import { sendTransactionalEmail } from "../lib/email.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { rateLimitHit } from "../lib/rate-limit.js";
import { config } from "../lib/config.js";
import { randomToken } from "../lib/token.js";
import { hashToken } from "../lib/token.js";
import { createSession, revokeSession } from "../middleware/session.js";
import type { AppEnv } from "../types.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(120).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  scope: z.enum(["MEMBER", "ADMIN"]).optional(),
});

export const authRoutes = new Hono()
  .post("/register", async (c) => {
    const ip = c.req.header("x-forwarded-for") ?? "unknown";
    const rl = await rateLimitHit(prisma, `register:${ip}`, { max: 10 });
    if (!rl.ok) throw new ApiError(429, "Too many requests", "RATE_LIMIT");

    const body = registerSchema.parse(await c.req.json());
    const exists = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (exists) throw new ApiError(409, "Email already registered", "EMAIL_IN_USE");

    const passwordHash = await hashPassword(body.password);
    const verifyToken = randomToken(24);
    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        name: body.name,
        roles: {
          create: {
            role: {
              connect: { name: "member" },
            },
          },
        },
        emailVerificationTokens: {
          create: {
            tokenHash: hashToken(verifyToken),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
          },
        },
      },
    });

    const verifyUrl = `${config.publicSiteUrl()}/verify-email?token=${verifyToken}`;
    await sendTransactionalEmail({
      to: user.email,
      subject: "Verify your email",
      html: `<p>Welcome${user.name ? `, ${user.name}` : ""}.</p><p><a href="${verifyUrl}">Verify your email</a></p>`,
    });

    return c.json({ ok: true, userId: user.id });
  })
  .post("/login", async (c) => {
    const ip = c.req.header("x-forwarded-for") ?? "unknown";
    const rl = await rateLimitHit(prisma, `login:${ip}`, { max: 40 });
    if (!rl.ok) throw new ApiError(429, "Too many requests", "RATE_LIMIT");

    const body = loginSchema.parse(await c.req.json());
    const scope = (body.scope ?? "MEMBER") as SessionScope;

    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (!user || !(await verifyPassword(user.passwordHash, body.password))) {
      throw new ApiError(401, "Invalid credentials", "INVALID_CREDENTIALS");
    }

    if (scope === SessionScope.ADMIN) {
      const perms = await prisma.permission.findMany({
        where: {
          roles: {
            some: {
              role: {
                users: { some: { userId: user.id } },
              },
            },
          },
        },
        select: { key: true },
      });
      const keys = perms.map((p) => p.key);
      if (!keys.some((k) => k.startsWith("admin."))) {
        throw new ApiError(403, "Not an admin user", "NOT_ADMIN");
      }
    }

    const token = randomToken(32);
    const { expiresAt } = await createSession(user.id, scope, token);
    const cookieName = scope === SessionScope.ADMIN ? config.adminCookie() : config.memberCookie();
    setCookie(c, cookieName, token, {
      httpOnly: true,
      path: "/",
      sameSite: "Lax",
      secure: config.isProd,
      expires: expiresAt,
    });

    return c.json({ ok: true });
  })
  .post("/logout", async (c) => {
    const body = z
      .object({ scope: z.enum(["MEMBER", "ADMIN"]).optional() })
      .parse(await c.req.json().catch(() => ({})));
    const scope = (body.scope ?? "MEMBER") as SessionScope;
    const cookieName = scope === SessionScope.ADMIN ? config.adminCookie() : config.memberCookie();
    const raw = getCookie(c, cookieName);
    if (raw) await revokeSession(raw);
    setCookie(c, cookieName, "", { httpOnly: true, path: "/", maxAge: 0 });
    return c.json({ ok: true });
  })
  .post("/forgot-password", async (c) => {
    const ip = c.req.header("x-forwarded-for") ?? "unknown";
    const rl = await rateLimitHit(prisma, `forgot:${ip}`, { max: 10 });
    if (!rl.ok) throw new ApiError(429, "Too many requests", "RATE_LIMIT");

    const body = z.object({ email: z.string().email() }).parse(await c.req.json());
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (user) {
      const token = randomToken(24);
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        },
      });
      const url = `${config.publicSiteUrl()}/reset-password?token=${token}`;
      await sendTransactionalEmail({
        to: user.email,
        subject: "Reset your password",
        html: `<p><a href="${url}">Reset password</a> (expires in 1 hour)</p>`,
      });
    }
    return c.json({ ok: true });
  })
  .post("/reset-password", async (c) => {
    const body = z
      .object({ token: z.string().min(10), password: z.string().min(8) })
      .parse(await c.req.json());
    const tokenHash = hashToken(body.token);
    const pr = await prisma.passwordResetToken.findFirst({
      where: { tokenHash, expiresAt: { gt: new Date() } },
    });
    if (!pr) throw new ApiError(400, "Invalid or expired token", "INVALID_TOKEN");
    const passwordHash = await hashPassword(body.password);
    await prisma.$transaction([
      prisma.user.update({ where: { id: pr.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.deleteMany({ where: { userId: pr.userId } }),
      prisma.session.deleteMany({ where: { userId: pr.userId } }),
    ]);
    return c.json({ ok: true });
  })
  .post("/verify-email", async (c) => {
    const body = z.object({ token: z.string().min(10) }).parse(await c.req.json());
    const tokenHash = hashToken(body.token);
    const row = await prisma.emailVerificationToken.findFirst({
      where: { tokenHash, expiresAt: { gt: new Date() } },
    });
    if (!row) throw new ApiError(400, "Invalid or expired token", "INVALID_TOKEN");
    await prisma.$transaction([
      prisma.user.update({
        where: { id: row.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      prisma.emailVerificationToken.deleteMany({ where: { userId: row.userId } }),
    ]);
    return c.json({ ok: true });
  });
