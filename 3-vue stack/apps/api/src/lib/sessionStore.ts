import type { PrismaClient } from "@prisma/client";
import type session from "express-session";
import { Store } from "express-session";

export function createPrismaSessionStore(prisma: PrismaClient): session.Store {
  class PrismaSessionStore extends Store {
    get(sid: string, callback: (err: unknown, sess?: session.SessionData | null) => void) {
      void prisma.session
        .findUnique({ where: { sid } })
        .then((row) => {
          if (!row || row.expiresAt < new Date()) {
            callback(null, null);
            return;
          }
          callback(null, row.data as unknown as session.SessionData);
        })
        .catch((err) => callback(err));
    }

    set(sid: string, sess: session.SessionData, callback?: (err?: unknown) => void) {
      const expires =
        sess.cookie?.expires instanceof Date
          ? sess.cookie.expires
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      void prisma.session
        .upsert({
          where: { sid },
          create: {
            sid,
            data: sess as object,
            expiresAt: expires,
          },
          update: {
            data: sess as object,
            expiresAt: expires,
          },
        })
        .then(() => callback?.())
        .catch((err) => callback?.(err));
    }

    destroy(sid: string, callback?: (err?: unknown) => void) {
      void prisma.session
        .delete({ where: { sid } })
        .catch(() => undefined)
        .finally(() => callback?.());
    }
  }

  return new PrismaSessionStore();
}
