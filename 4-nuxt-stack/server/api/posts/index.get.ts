import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(24, Number(query.pageSize) || 10)
  const skip = (page - 1) * pageSize

  const [total, items] = await prisma.$transaction([
    prisma.post.count({ where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } } }),
    prisma.post.findMany({
      where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        author: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        featuredImage: true,
      },
    }),
  ])

  return { total, page, pageSize, items }
})
