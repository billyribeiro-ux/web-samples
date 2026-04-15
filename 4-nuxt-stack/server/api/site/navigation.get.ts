import prisma from '../../utils/prisma'

export default defineEventHandler(async () => {
  const header = await prisma.navigationMenu.findUnique({
    where: { key: 'header' },
    include: { items: { orderBy: { sort: 'asc' }, where: { parentId: null } } },
  })
  const footer = await prisma.navigationMenu.findUnique({
    where: { key: 'footer' },
    include: { items: { orderBy: { sort: 'asc' }, where: { parentId: null } } },
  })
  return { header, footer }
})
