import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function requireUser(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: { include: { permission: true } },
            },
          },
        },
      },
    },
  });
  if (!user) {
    req.session.userId = undefined;
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.user = user;
  next();
}

export function requirePermission(...slugs: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const set = new Set<string>();
    for (const ur of req.user.roles) {
      for (const rp of ur.role.permissions) {
        set.add(rp.permission.slug);
      }
    }
    const ok = slugs.some((s) => set.has(s));
    if (!ok) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
