import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  listPublished() {
    return this.prisma.product.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: { name: 'asc' },
    });
  }

  findPublishedBySlug(slug: string) {
    return this.prisma.product.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
      include: { categories: { include: { category: true } } },
    });
  }

  listAdmin() {
    return this.prisma.product.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  create(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data });
  }

  async update(slug: string, data: Prisma.ProductUpdateInput) {
    const p = await this.prisma.product.findUnique({ where: { slug } });
    if (!p) throw new NotFoundException();
    return this.prisma.product.update({ where: { slug }, data });
  }

  async remove(slug: string) {
    await this.prisma.product.delete({ where: { slug } });
  }
}
