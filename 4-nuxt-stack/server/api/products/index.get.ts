import prisma from '../../utils/prisma'

export default defineEventHandler(async () => {
  const items = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    include: { categories: { include: { category: true } }, featuredImage: true },
  })
  return { items }
})
