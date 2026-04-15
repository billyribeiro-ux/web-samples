import { db } from '$lib/server/db';
import { category } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { categories: await db.select().from(category) };
};
