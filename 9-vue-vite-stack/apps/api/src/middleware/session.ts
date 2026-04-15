import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { readSessionCookie } from "../lib/session.js";
import type { SessionWithUser } from "../types/express.js";

export async function attachSession(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = readSessionCookie(req.env, req.cookies as Record<string, string | undefined>);
    if (!token) {
      req.sessionRecord = null;
      return next();
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
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
        },
      },
    });

    if (!session) {
      req.sessionRecord = null;
      return next();
    }

    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
      req.sessionRecord = null;
      return next();
    }

    req.sessionRecord = session as SessionWithUser;
    next();
  } catch (e) {
    next(e);
  }
}
