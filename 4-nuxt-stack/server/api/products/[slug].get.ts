import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400 })
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    include: { categories: { include: { category: true } }, featuredImage: true },
  })
  if (!product) throw createError({ statusCode: 404 })
  return { product }
})
