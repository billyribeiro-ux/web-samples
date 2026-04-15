import prisma from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const base = config.public.siteUrl.replace(/\/$/, '')
  const [posts, pages, products] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    }),
    prisma.page.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    }),
    prisma.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    }),
  ])

  const urls: { loc: string; lastmod?: string }[] = [
    { loc: `${base}/` },
    { loc: `${base}/about` },
    { loc: `${base}/services` },
    { loc: `${base}/pricing` },
    { loc: `${base}/blog` },
    { loc: `${base}/products` },
    { loc: `${base}/contact` },
    { loc: `${base}/faq` },
    ...posts.map((p) => ({ loc: `${base}/blog/${p.slug}`, lastmod: p.updatedAt.toISOString() })),
    ...pages
      .filter((p) => p.slug !== 'about')
      .map((p) => ({ loc: `${base}/${p.slug}`, lastmod: p.updatedAt.toISOString() })),
    ...products.map((p) => ({ loc: `${base}/products/${p.slug}`, lastmod: p.updatedAt.toISOString() })),
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`,
  )
  .join('\n')}
</urlset>`
  setHeader(event, 'content-type', 'application/xml')
  return body
})
