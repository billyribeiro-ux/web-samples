import { asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { plan } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const plans = await db.select().from(plan).where(eq(plan.active, true)).orderBy(asc(plan.sortOrder));
	return { plans };
};
