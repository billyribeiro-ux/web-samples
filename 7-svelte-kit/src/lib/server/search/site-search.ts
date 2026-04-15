import { and, desc, eq, ilike, or } from 'drizzle-orm';
import { db } from '../db';
import { page, post, product } from '../db/schema';

export type SearchHit =
	| { type: 'post'; id: string; title: string; href: string; snippet: string | null }
	| { type: 'page'; id: string; title: string; href: string; snippet: string | null }
	| { type: 'product'; id: string; title: string; href: string; snippet: string | null };

/** Postgres-backed search with ILIKE; swap for tsvector or external provider behind this API. */
export async function searchSite(q: string, limit = 25): Promise<SearchHit[]> {
	const term = q.trim();
	if (term.length < 2) return [];

	const pattern = `%${term}%`;

	const posts = await db
		.select()
		.from(post)
		.where(
			and(
				eq(post.status, 'published'),
				or(
					ilike(post.title, pattern),
					ilike(post.excerpt, pattern),
					ilike(post.bodyHtml, pattern)
				)
			)
		)
		.orderBy(desc(post.publishedAt))
		.limit(limit);

	const pages = await db
		.select()
		.from(page)
		.where(
			and(
				eq(page.status, 'published'),
				or(ilike(page.title, pattern), ilike(page.bodyHtml, pattern))
			)
		)
		.limit(limit);

	const products = await db
		.select()
		.from(product)
		.where(
			and(
				eq(product.status, 'active'),
				or(ilike(product.name, pattern), ilike(product.descriptionHtml, pattern))
			)
		)
		.limit(limit);

	const hits: SearchHit[] = [
		...posts.map((p) => ({
			type: 'post' as const,
			id: p.id,
			title: p.title,
			href: `/blog/${p.slug}`,
			snippet: p.excerpt
		})),
		...pages.map((p) => ({
			type: 'page' as const,
			id: p.id,
			title: p.title,
			href: `/${p.slug}`,
			snippet: p.excerpt
		})),
		...products.map((p) => ({
			type: 'product' as const,
			id: p.id,
			title: p.name,
			href: `/products/${p.slug}`,
			snippet: null
		}))
	];

	return hits.slice(0, limit);
}
