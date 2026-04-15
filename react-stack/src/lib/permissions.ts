import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const PERMISSIONS = {
  ADMIN_ACCESS: "admin:access",
  CMS_POSTS: "cms:posts",
  CMS_PAGES: "cms:pages",
  CMS_MEDIA: "cms:media",
  COMMERCE: "commerce:manage",
  USERS: "users:manage",
} as const;

export async function getSessionOrThrow() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}

export function sessionHasRole(session: { user: { roles: string[] } }, role: string) {
  return session.user.roles.includes(role);
}

export async function assertAdmin() {
  const session = await getSessionOrThrow();
  const allowed =
    sessionHasRole(session, "super_admin") ||
    sessionHasRole(session, "admin") ||
    sessionHasRole(session, "editor");
  if (!allowed) {
    throw new Error("Forbidden");
  }
  return session;
}

export async function assertPermission(key: string) {
  const session = await getSessionOrThrow();
  const userId = session.user.id;
  const rows = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  });
  const keys = new Set<string>();
  for (const ur of rows) {
    for (const rp of ur.role.permissions) {
      keys.add(rp.permission.key);
    }
  }
  if (sessionHasRole(session, "super_admin")) {
    return session;
  }
  if (!keys.has(key)) {
    throw new Error("Forbidden");
  }
  return session;
}

export async function userHasActiveSubscription(userId: string) {
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ["ACTIVE", "TRIALING"] },
    },
  });
  return !!sub;
}
