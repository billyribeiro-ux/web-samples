import type { Context, Next } from "hono";
import { ApiError } from "../lib/errors.js";
import type { AppEnv } from "../types.js";

export function requireMember() {
  return async (c: Context<AppEnv>, next: Next) => {
    const u = c.get("authUser");
    if (!u) throw new ApiError(401, "Sign in required", "UNAUTHORIZED");
    await next();
  };
}

export function requireAdminPermission(permission: string) {
  return async (c: Context<AppEnv>, next: Next) => {
    const u = c.get("authUser");
    if (!u) throw new ApiError(401, "Admin sign in required", "UNAUTHORIZED");
    if (!u.permissions.includes(permission)) {
      throw new ApiError(403, "Missing permission", "FORBIDDEN", { permission });
    }
    await next();
  };
}
