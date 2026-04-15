import { auth, currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

function mapMetadataRoleToEnum(role: unknown): UserRole | null {
  if (typeof role !== "string") return null;
  const u = role.toUpperCase();
  if (u === "ADMIN") return UserRole.ADMIN;
  if (u === "EDITOR") return UserRole.EDITOR;
  if (u === "SUBSCRIBER") return UserRole.SUBSCRIBER;
  if (u === "USER") return UserRole.USER;
  return null;
}

/** Create or update local User from Clerk session (Edge-safe callers should use webhook; this runs in Node server components/actions). */
export async function ensureDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existing) {
    const u = await currentUser();
    if (u) {
      const email =
        u.primaryEmailAddress?.emailAddress ?? u.emailAddresses[0]?.emailAddress ?? existing.email;
      const metaRole = mapMetadataRoleToEnum(u.publicMetadata?.role);
      return prisma.user.update({
        where: { clerkId: userId },
        data: {
          email,
          name: u.fullName ?? u.firstName ?? existing.name,
          image: u.imageUrl ?? existing.image,
          ...(metaRole ? { role: metaRole } : {}),
        },
      });
    }
    return existing;
  }

  const u = await currentUser();
  if (!u) return null;
  const email =
    u.primaryEmailAddress?.emailAddress ?? u.emailAddresses[0]?.emailAddress ?? "unknown@localhost";
  const metaRole = mapMetadataRoleToEnum(u.publicMetadata?.role) ?? UserRole.USER;

  return prisma.user.create({
    data: {
      clerkId: userId,
      email,
      name: u.fullName ?? u.firstName ?? null,
      image: u.imageUrl ?? null,
      role: metaRole,
    },
  });
}

export async function requireDbUser() {
  const user = await ensureDbUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...allowed: UserRole[]) {
  const user = await requireDbUser();
  if (!allowed.includes(user.role)) {
    redirect("/account");
  }
  return user;
}

export async function requireAdminOrEditor() {
  return requireRole(UserRole.ADMIN, UserRole.EDITOR);
}

export async function requireAdmin() {
  return requireRole(UserRole.ADMIN);
}
