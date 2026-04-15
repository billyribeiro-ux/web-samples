import { eq } from 'drizzle-orm';
import { requireLogin } from '$lib/server/rbac/guards';
import { db } from '$lib/server/db';
import { favorite, product } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const u = requireLogin(event);
	const rows = await db
		.select({
			product
		})
		.from(favorite)
		.innerJoin(product, eq(favorite.productId, product.id))
		.where(eq(favorite.userId, u.id));
	return { favorites: rows.map((r) => r.product) };
};
