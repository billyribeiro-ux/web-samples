import type { Context, Next } from "hono";
import type { AppEnv } from "../types.js";
import { getCookie } from "hono/cookie";
import type { SessionScope, User } from "@repo/db";
import { prisma } from "@repo/db";
import { config } from "../lib/config.js";
import { hashToken } from "../lib/token.js";

export type AuthedUser = User & { permissions: string[] };

async function permissionsForUser(userId: string): Promise<string[]> {
  const rows = await prisma.permission.findMany({
    where: {
      roles: {
        some: {
          role: {
            users: {
              some: { userId },
            },
          },
        },
      },
    },
    select: { key: true },
  });
  return rows.map((r) => r.key);
}

export function loadSession(scope: SessionScope) {
  return async (c: Context<AppEnv>, next: Next) => {
    const cookieName = scope === "ADMIN" ? config.adminCookie() : config.memberCookie();
    const raw = getCookie(c, cookieName);
    if (!raw) {
      c.set("authUser", null);
      return next();
    }
    const tokenHash = hashToken(raw);
    const session = await prisma.session.findFirst({
      where: {
        tokenHash,
        scope,
        expiresAt: { gt: new Date() },
      },
    });
    if (!session) {
      c.set("authUser", null);
      return next();
    }
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      c.set("authUser", null);
      return next();
    }
    const permissions = await permissionsForUser(user.id);
    c.set("authUser", { ...user, permissions });
    await next();
  };
}

export async function createSession(userId: string, scope: SessionScope, token: string) {
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
  await prisma.session.create({
    data: { userId, tokenHash, scope, expiresAt },
  });
  return { expiresAt };
}

export async function revokeSession(token: string) {
  const tokenHash = hashToken(token);
  await prisma.session.deleteMany({ where: { tokenHash } });
}
