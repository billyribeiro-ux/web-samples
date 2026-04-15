import type { UserRole } from '@prisma/client';

const ROLE_ORDER: Record<UserRole, number> = {
  FREE_USER: 0,
  MEMBER: 1,
  EDITOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

export function hasMinRole(role: UserRole, min: UserRole): boolean {
  return ROLE_ORDER[role] >= ROLE_ORDER[min];
}

export function isStaff(role: UserRole): boolean {
  return hasMinRole(role, 'EDITOR');
}
