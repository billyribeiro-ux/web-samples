import prisma from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const base = config.public.siteUrl.replace(/\/$/, '')
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 30,
    include: { author: true },
  })

  const items = posts
    .map(
      (p) => `
  <item>
    <title><![CDATA[${p.title}]]></title>
    <link>${base}/blog/${p.slug}</link>
    <guid>${base}/blog/${p.slug}</guid>
    <pubDate>${p.publishedAt?.toUTCString()}</pubDate>
    <description><![CDATA[${p.excerpt || ''}]]></description>
  </item>`,
    )
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${config.public.siteName} Blog</title>
    <link>${base}/blog</link>
    <description>Latest articles</description>
    ${items}
  </channel>
</rss>`
  setHeader(event, 'content-type', 'application/rss+xml')
  return xml
})
