import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400 })
  const post = await prisma.post.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
    },
    include: {
      author: true,
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      featuredImage: true,
    },
  })
  if (!post) throw createError({ statusCode: 404 })
  const related = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      id: { not: post.id },
      categories: { some: { categoryId: { in: post.categories.map((c) => c.categoryId) } } },
    },
    take: 3,
    include: { featuredImage: true },
  })
  return { post, related }
})
