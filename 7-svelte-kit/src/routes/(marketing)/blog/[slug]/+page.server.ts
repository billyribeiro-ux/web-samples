import { error, redirect } from '@sveltejs/kit';
import { getPostBySlug } from '$lib/server/content/posts';
import { hasActiveSubscription } from '$lib/server/subscription';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const data = await getPostBySlug(params.slug);
	if (!data) throw error(404, 'Not found');

	if (data.post.membersOnly) {
		if (!locals.user) {
			throw redirect(302, `/login?next=${encodeURIComponent(`/blog/${params.slug}`)}`);
		}
		const ok = await hasActiveSubscription(locals.user.id);
		if (!ok) throw redirect(302, '/pricing');
	}

	const title = data.post.seoTitle ?? data.post.title;
	const description = data.post.seoDescription ?? data.post.excerpt ?? '';

	return {
		post: data.post,
		author: data.author,
		categories: data.categories,
		tags: data.tags,
		meta: {
			title,
			description,
			canonicalUrl: data.post.canonicalUrl,
			ogImage: data.post.ogImageUrl
		}
	};
};
