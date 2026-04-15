import { clerkClient, getAuth } from '@clerk/express';
import type { User, UserRole } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { hasMinRole } from '../lib/roles.js';

export type RequestWithUser = Request & { dbUser?: User };

export async function attachDbUserOptional(req: RequestWithUser, _res: Response, next: NextFunction) {
  const { userId } = getAuth(req);
  if (!userId) {
    return next();
  }
  try {
    req.dbUser = await ensureUserRow(userId);
    next();
  } catch (e) {
    next(e);
  }
}

export async function requireDbUser(req: RequestWithUser, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    req.dbUser = await ensureUserRow(userId);
    next();
  } catch (e) {
    next(e);
  }
}

export async function requireStaff(req: RequestWithUser, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const u = await ensureUserRow(userId);
    req.dbUser = u;
    if (!['EDITOR', 'ADMIN', 'SUPER_ADMIN'].includes(u.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  } catch (e) {
    next(e);
  }
}

export function requireMinRole(min: UserRole) {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const u = await ensureUserRow(userId);
      req.dbUser = u;
      if (!hasMinRole(u.role, min)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}

async function ensureUserRow(clerkId: string): Promise<User> {
  const existing = await prisma.user.findUnique({ where: { clerkId } });
  if (existing) return existing;

  const clerkUser = await clerkClient.users.getUser(clerkId);
  const email = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
    ?.emailAddress;
  const primary =
    email ?? clerkUser.emailAddresses[0]?.emailAddress ?? `user+${clerkId}@placeholder.local`;

  return prisma.user.create({
    data: {
      clerkId,
      email: primary,
      firstName: clerkUser.firstName ?? undefined,
      lastName: clerkUser.lastName ?? undefined,
      imageUrl: clerkUser.imageUrl ?? undefined,
    },
  });
}
