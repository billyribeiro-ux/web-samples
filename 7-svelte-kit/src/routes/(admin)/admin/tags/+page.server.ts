import { db } from '$lib/server/db';
import { tag } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { tags: await db.select().from(tag) };
};
