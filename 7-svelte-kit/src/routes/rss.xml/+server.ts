import { desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { author, post } from '$lib/server/db/schema';
import { env as publicEnv } from '$env/dynamic/public';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const origin = (publicEnv.PUBLIC_APP_URL ?? 'http://localhost:5173').replace(/\/$/, '');

	const rows = await db
		.select({ post, author })
		.from(post)
		.innerJoin(author, eq(post.authorId, author.id))
		.where(eq(post.status, 'published'))
		.orderBy(desc(post.publishedAt))
		.limit(30);

	const items = rows
		.map(
			(r) => `
    <item>
      <title>${escapeXml(r.post.title)}</title>
      <link>${origin}/blog/${r.post.slug}</link>
      <guid>${origin}/blog/${r.post.slug}</guid>
      <pubDate>${r.post.publishedAt?.toUTCString() ?? new Date().toUTCString()}</pubDate>
      <description>${escapeXml(r.post.excerpt ?? '')}</description>
    </item>`
		)
		.join('');

	const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Acme Platform Blog</title>
    <link>${origin}/blog</link>
    <description>Latest posts</description>
    ${items}
  </channel>
</rss>`;

	return new Response(xml, {
		headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' }
	});
};

function escapeXml(s: string) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
