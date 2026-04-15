import { eq } from 'drizzle-orm';
import { db } from '../db';
import { permission, role, rolePermission, userRole } from '../db/schema';

export async function loadAuthContext(userId: string): Promise<{
	roles: string[];
	permissions: Set<string>;
}> {
	const rolesRows = await db
		.select({ name: role.name })
		.from(userRole)
		.innerJoin(role, eq(userRole.roleId, role.id))
		.where(eq(userRole.userId, userId));

	const roles = rolesRows.map((r) => r.name);

	const permRows = await db
		.select({ slug: permission.slug })
		.from(userRole)
		.innerJoin(rolePermission, eq(userRole.roleId, rolePermission.roleId))
		.innerJoin(permission, eq(rolePermission.permissionId, permission.id))
		.where(eq(userRole.userId, userId));

	return {
		roles,
		permissions: new Set(permRows.map((p) => p.slug))
	};
}

export function hasPermission(permissions: Set<string>, slug: string): boolean {
	return permissions.has(slug);
}

export function hasAnyAdminAccess(roles: string[]): boolean {
	return roles.some((r) => r === 'admin' || r === 'super_admin' || r === 'editor');
}
