import prisma from './prisma'

export type SearchHit = {
  type: 'post' | 'page' | 'product'
  id: string
  title: string
  slug: string
  excerpt?: string | null
  url: string
}

/**
 * PostgreSQL full-text search; replace implementation with Algolia/Meilisearch later.
 */
export async function searchSite(query: string, take = 20): Promise<SearchHit[]> {
  const q = query.trim()
  if (q.length < 2) return []

  const [posts, pages, products] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { excerpt: { contains: q, mode: 'insensitive' } },
        ],
      },
      take,
      select: { id: true, title: true, slug: true, excerpt: true },
    }),
    prisma.page.findMany({
      where: {
        status: 'PUBLISHED',
        title: { contains: q, mode: 'insensitive' },
      },
      take,
      select: { id: true, title: true, slug: true },
    }),
    prisma.product.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take,
      select: { id: true, name: true, slug: true, description: true },
    }),
  ])

  const hits: SearchHit[] = [
    ...posts.map((p) => ({
      type: 'post' as const,
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      url: `/blog/${p.slug}`,
    })),
    ...pages.map((p) => ({
      type: 'page' as const,
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: null,
      url: `/${p.slug === 'home' ? '' : p.slug}`,
    })),
    ...products.map((p) => ({
      type: 'product' as const,
      id: p.id,
      title: p.name,
      slug: p.slug,
      excerpt: p.description.slice(0, 160),
      url: `/products/${p.slug}`,
    })),
  ]

  return hits.slice(0, take)
}
