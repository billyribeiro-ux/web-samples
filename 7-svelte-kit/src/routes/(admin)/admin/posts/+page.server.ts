import { desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { author, post } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db
		.select({ post, author })
		.from(post)
		.innerJoin(author, eq(post.authorId, author.id))
		.orderBy(desc(post.updatedAt));
	return { posts: rows };
};
