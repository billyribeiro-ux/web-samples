import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400 })
  const tag = await prisma.tag.findUnique({ where: { slug } })
  if (!tag) throw createError({ statusCode: 404 })
  const posts = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      tags: { some: { tagId: tag.id } },
    },
    orderBy: { publishedAt: 'desc' },
    include: { featuredImage: true, author: true },
  })
  return { tag, posts }
})
