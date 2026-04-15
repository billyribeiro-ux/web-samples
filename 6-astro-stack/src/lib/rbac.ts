import { prisma } from '@/lib/prisma';

export async function getRoleSlugsForUser(userId: string): Promise<string[]> {
  const rows = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  });
  return rows.map((r) => r.role.slug);
}

export function hasAnyRole(slugs: string[], required: string | string[]): boolean {
  const need = Array.isArray(required) ? required : [required];
  return need.some((s) => slugs.includes(s));
}

export const ADMIN_ROLES = ['superadmin', 'admin', 'editor'] as const;

export function canAccessAdmin(slugs: string[]): boolean {
  return hasAnyRole(slugs, [...ADMIN_ROLES]);
}
