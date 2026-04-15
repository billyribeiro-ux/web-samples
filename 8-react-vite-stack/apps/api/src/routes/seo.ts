import { Router } from 'express';
import { ContentStatus, ProductStatus } from '@prisma/client';
import type { Env } from '../lib/env.js';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/errors.js';

export function createSeoRouter(env: Env) {
  const router = Router();
  const siteBase = env.FRONTEND_URL.replace(/\/$/, '');
  const apiBase = (env.API_PUBLIC_URL ?? env.FRONTEND_URL).replace(/\/$/, '');

  router.get(
    '/sitemap.xml',
    asyncHandler(async (_req, res) => {
      const [posts, pages, products] = await Promise.all([
        prisma.post.findMany({
          where: { status: ContentStatus.PUBLISHED },
          select: { slug: true, updatedAt: true },
        }),
        prisma.page.findMany({
          where: { status: ContentStatus.PUBLISHED },
          select: { slug: true, updatedAt: true },
        }),
        prisma.product.findMany({
          where: { status: ProductStatus.ACTIVE },
          select: { slug: true, updatedAt: true },
        }),
      ]);

      const staticPaths = [
        '',
        '/about',
        '/services',
        '/pricing',
        '/blog',
        '/contact',
        '/faq',
        '/search',
        '/privacy-policy',
        '/terms',
        '/cookies',
      ];

      const urls: string[] = [];
      for (const p of staticPaths) {
        urls.push(`${siteBase}${p || '/'}`);
      }
      for (const p of posts) {
        urls.push(`${siteBase}/blog/${p.slug}`);
      }
      for (const p of pages) {
        urls.push(`${siteBase}/${p.slug}`);
      }
      for (const p of products) {
        urls.push(`${siteBase}/products/${p.slug}`);
      }

      const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (loc) => `  <url><loc>${escapeXml(loc)}</loc><changefreq>weekly</changefreq></url>`
  )
  .join('\n')}
</urlset>`;
      res.type('application/xml').send(body);
    })
  );

  router.get(
    '/robots.txt',
    asyncHandler(async (_req, res) => {
      res.type('text/plain').send(`User-agent: *
Allow: /
Sitemap: ${apiBase}/api/seo/sitemap.xml
`);
    })
  );

  return router;
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
