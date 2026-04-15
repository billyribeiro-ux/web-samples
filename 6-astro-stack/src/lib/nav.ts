import { prisma } from '@/lib/prisma';

export async function getMainNav() {
  const menu = await prisma.navigationMenu.findUnique({
    where: { slug: 'main' },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  });
  return menu?.items ?? [];
}
