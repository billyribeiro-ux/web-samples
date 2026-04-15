import { desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { product } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db
		.select()
		.from(product)
		.where(eq(product.status, 'active'))
		.orderBy(desc(product.updatedAt));
	return { products: rows };
};
