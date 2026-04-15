import { db } from '$lib/server/db';
import { navigationMenu } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { menus: await db.select().from(navigationMenu) };
};
