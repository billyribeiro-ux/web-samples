import { desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { formSubmission } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db.select().from(formSubmission).orderBy(desc(formSubmission.createdAt)).limit(200);
	return { submissions: rows };
};
