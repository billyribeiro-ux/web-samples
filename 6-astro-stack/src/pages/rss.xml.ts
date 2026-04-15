import type { APIRoute } from 'astro';

import { prisma } from '@/lib/prisma';
import { absoluteUrl } from '@/lib/site';

export const prerender = false;

export const GET: APIRoute = async () => {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 50,
  });

  const items = posts
    .map(
      (p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${absoluteUrl(`/blog/${p.slug}`)}</link>
      <guid>${absoluteUrl(`/blog/${p.slug}`)}</guid>
      <pubDate>${p.publishedAt?.toUTCString() ?? ''}</pubDate>
      <description><![CDATA[${p.excerpt ?? ''}]]></description>
    </item>`,
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Astro Business Blog</title>
    <link>${absoluteUrl('/blog')}</link>
    <description>Latest posts</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml' } });
};
