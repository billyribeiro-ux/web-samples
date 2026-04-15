import { desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { mediaAsset } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db.select().from(mediaAsset).orderBy(desc(mediaAsset.createdAt)).limit(100);
	return { media: rows };
};
