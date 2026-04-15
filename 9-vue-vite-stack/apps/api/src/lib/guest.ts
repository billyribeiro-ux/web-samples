import type { Response } from "express";
import { randomUUID } from "crypto";
import type { Env } from "./env.js";

const COOKIE = "gid";

export function readGuestId(cookies: Record<string, string | undefined>): string | undefined {
  return cookies[COOKIE];
}

export function ensureGuestCookie(env: Env, res: Response, cookies: Record<string, string | undefined>) {
  let gid = readGuestId(cookies);
  if (!gid) {
    gid = randomUUID();
    const secure = env.NODE_ENV === "production";
    res.cookie(COOKIE, gid, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      maxAge: 1000 * 60 * 60 * 24 * 180,
      path: "/",
    });
  }
  return gid;
}
