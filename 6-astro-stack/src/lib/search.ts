import { prisma } from '@/lib/prisma';

export async function searchSite(query: string) {
  const q = query.trim();
  if (q.length < 2) {
    return { posts: [] as const, products: [] as const, pages: [] as const };
  }

  const [posts, products, pages] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { excerpt: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 15,
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 15,
    }),
    prisma.page.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { body: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 10,
    }),
  ]);

  return { posts, products, pages };
}
