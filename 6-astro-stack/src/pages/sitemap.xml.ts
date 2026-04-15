import type { APIRoute } from 'astro';

import { prisma } from '@/lib/prisma';
import { absoluteUrl } from '@/lib/site';

export const prerender = false;

export const GET: APIRoute = async () => {
  const [posts, products, pages] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.page.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticPaths = [
    '/',
    '/about',
    '/services',
    '/pricing',
    '/blog',
    '/contact',
    '/faq',
    '/products',
    '/search',
    '/privacy-policy',
    '/terms',
    '/cookies',
  ];

  const urls = [
    ...staticPaths.map((p) => ({ loc: absoluteUrl(p), lastmod: new Date().toISOString() })),
    ...posts.map((p) => ({
      loc: absoluteUrl(`/blog/${p.slug}`),
      lastmod: p.updatedAt.toISOString(),
    })),
    ...products.map((p) => ({
      loc: absoluteUrl(`/products/${p.slug}`),
      lastmod: p.updatedAt.toISOString(),
    })),
    ...pages.map((p) => ({
      loc: absoluteUrl(`/${p.slug}`),
      lastmod: p.updatedAt.toISOString(),
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
