import { db } from '$lib/server/db';
import { siteSetting } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { settings: await db.select().from(siteSetting) };
};
