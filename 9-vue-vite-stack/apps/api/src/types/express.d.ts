import type { Permission, Role, Session, User } from "@prisma/client";
import type { Env } from "../lib/env.js";

export type AuthedUser = User & {
  roles: { role: Role & { permissions: { permission: Permission }[] } }[];
};

export type SessionWithUser = Session & { user: AuthedUser };

declare global {
  namespace Express {
    interface Request {
      env: Env;
      sessionRecord?: SessionWithUser | null;
      cookies: Record<string, string | undefined>;
    }
  }
}

export {};
