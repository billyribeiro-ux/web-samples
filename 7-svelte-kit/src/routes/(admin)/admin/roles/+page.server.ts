import { db } from '$lib/server/db';
import { permission, role, rolePermission } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const roles = await db.select().from(role);
	const perms = await db.select().from(permission);
	const links = await db
		.select({
			roleId: rolePermission.roleId,
			permissionSlug: permission.slug
		})
		.from(rolePermission)
		.innerJoin(permission, eq(rolePermission.permissionId, permission.id));
	return { roles, permissions: perms, rolePermissionLinks: links };
};
