import type { Prisma } from "@prisma/client";

type UserWithRoles = Prisma.UserGetPayload<{
  include: {
    roles: {
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } };
          };
        };
      };
    };
  };
}>;

declare global {
  namespace Express {
    interface Request {
      user?: UserWithRoles;
    }
  }
}

export {};
