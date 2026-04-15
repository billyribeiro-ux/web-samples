import { listPublishedPosts } from '$lib/server/content/posts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await listPublishedPosts(50);
	return { posts: rows };
};
