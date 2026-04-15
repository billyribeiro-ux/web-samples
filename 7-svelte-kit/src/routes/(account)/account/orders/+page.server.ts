import { desc, eq } from 'drizzle-orm';
import { requireLogin } from '$lib/server/rbac/guards';
import { db } from '$lib/server/db';
import { order } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const u = requireLogin(event);
	const rows = await db
		.select()
		.from(order)
		.where(eq(order.userId, u.id))
		.orderBy(desc(order.createdAt));
	return { orders: rows };
};
