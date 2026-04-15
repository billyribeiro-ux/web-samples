import { db } from '$lib/server/db';
import { page, post, product } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { env as publicEnv } from '$env/dynamic/public';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const origin = (publicEnv.PUBLIC_APP_URL ?? 'http://localhost:5173').replace(/\/$/, '');

	const [posts, pages, products] = await Promise.all([
		db.select({ slug: post.slug, updatedAt: post.updatedAt }).from(post).where(eq(post.status, 'published')),
		db.select({ slug: page.slug, updatedAt: page.updatedAt }).from(page).where(eq(page.status, 'published')),
		db.select({ slug: product.slug, updatedAt: product.updatedAt }).from(product).where(eq(product.status, 'active'))
	]);

	const urls: { loc: string; lastmod?: string }[] = [
		{ loc: `${origin}/` },
		{ loc: `${origin}/about` },
		{ loc: `${origin}/services` },
		{ loc: `${origin}/pricing` },
		{ loc: `${origin}/blog` },
		{ loc: `${origin}/contact` },
		{ loc: `${origin}/faq` },
		{ loc: `${origin}/products` },
		...posts.map((p) => ({ loc: `${origin}/blog/${p.slug}`, lastmod: p.updatedAt.toISOString() })),
		...pages.map((p) => ({ loc: `${origin}/${p.slug}`, lastmod: p.updatedAt.toISOString() })),
		...products.map((p) => ({ loc: `${origin}/products/${p.slug}`, lastmod: p.updatedAt.toISOString() }))
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};

function escapeXml(s: string) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
