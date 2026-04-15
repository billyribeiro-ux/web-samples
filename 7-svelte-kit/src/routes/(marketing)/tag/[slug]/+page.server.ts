import { error } from '@sveltejs/kit';
import { listPostsByTagSlug } from '$lib/server/content/posts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { tag, posts } = await listPostsByTagSlug(params.slug);
	if (!tag) throw error(404, 'Tag not found');
	return { tag, posts };
};
