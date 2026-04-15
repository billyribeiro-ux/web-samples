import { searchSite } from '$lib/server/search/site-search';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q') ?? '';
	const results = await searchSite(q, 40);
	return { q, results };
};
