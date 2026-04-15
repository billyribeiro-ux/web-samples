import type { Response } from "express";
import { randomBytes } from "crypto";
import type { Env } from "./env.js";
import { prisma } from "./prisma.js";
import { newCsrfSecret } from "./csrf.js";

const MS_PER_DAY = 86400000;

export function generateSessionToken(): string {
  return randomBytes(48).toString("hex");
}

export function generateCsrfSecret(): string {
  return newCsrfSecret();
}

export async function createUserSession(
  env: Env,
  res: Response,
  userId: string
): Promise<{ sessionToken: string; csrfSecret: string }> {
  const token = generateSessionToken();
  const csrfSecret = generateCsrfSecret();
  const expiresAt = new Date(Date.now() + env.SESSION_DAYS * MS_PER_DAY);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
      csrfSecret,
    },
  });

  const secure = env.NODE_ENV === "production";
  res.cookie(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: env.SESSION_DAYS * MS_PER_DAY,
    path: "/",
  });

  return { sessionToken: token, csrfSecret };
}

export async function destroySession(env: Env, res: Response, sessionToken: string | undefined) {
  if (sessionToken) {
    await prisma.session.deleteMany({ where: { token: sessionToken } });
  }
  const secure = env.NODE_ENV === "production";
  res.clearCookie(env.SESSION_COOKIE_NAME, { path: "/", httpOnly: true, sameSite: "lax", secure });
}

export function readSessionCookie(env: Env, cookies: Record<string, string | undefined>) {
  return cookies[env.SESSION_COOKIE_NAME];
}
