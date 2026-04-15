import { desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { order } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db.select().from(order).orderBy(desc(order.createdAt)).limit(200);
	return { orders: rows };
};
