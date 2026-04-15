import { db } from '$lib/server/db';
import { page } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db.select().from(page);
	return { pages: rows };
};
