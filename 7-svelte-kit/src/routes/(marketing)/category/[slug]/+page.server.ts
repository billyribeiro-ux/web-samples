import { error } from '@sveltejs/kit';
import { listPostsByCategorySlug } from '$lib/server/content/posts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { category, posts } = await listPostsByCategorySlug(params.slug);
	if (!category) throw error(404, 'Category not found');
	return { category, posts };
};
