import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400 })
  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) throw createError({ statusCode: 404 })
  const posts = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      categories: { some: { categoryId: category.id } },
    },
    orderBy: { publishedAt: 'desc' },
    include: { featuredImage: true, author: true },
  })
  return { category, posts }
})
