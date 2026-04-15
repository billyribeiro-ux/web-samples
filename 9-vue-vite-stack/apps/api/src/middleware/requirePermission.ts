import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/errors.js";

function userHasPermission(req: Request, key: string): boolean {
  const user = req.sessionRecord?.user;
  if (!user) return false;
  for (const ur of user.roles) {
    for (const rp of ur.role.permissions) {
      if (rp.permission.key === key) return true;
    }
  }
  return false;
}

export function requirePermission(...keys: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.sessionRecord?.user) {
      return next(new HttpError(401, "Unauthorized"));
    }
    const ok = keys.some((k) => userHasPermission(req, k));
    if (!ok) return next(new HttpError(403, "Forbidden"));
    next();
  };
}

export function requireRole(...roleNames: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.sessionRecord?.user) {
      return next(new HttpError(401, "Unauthorized"));
    }
    const names = new Set(req.sessionRecord.user.roles.map((r: { role: { name: string } }) => r.role.name));
    const ok = roleNames.some((n) => names.has(n));
    if (!ok) return next(new HttpError(403, "Forbidden"));
    next();
  };
}
