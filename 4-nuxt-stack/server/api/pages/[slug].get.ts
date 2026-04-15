import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400 })
  const page = await prisma.page.findFirst({
    where: { slug, status: 'PUBLISHED' },
  })
  if (!page) throw createError({ statusCode: 404 })
  return { page }
})
