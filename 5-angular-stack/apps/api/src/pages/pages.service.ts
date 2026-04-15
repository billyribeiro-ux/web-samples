import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  listPublic() {
    return this.prisma.page.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: { title: 'asc' },
    });
  }

  findBySlugPublic(slug: string) {
    return this.prisma.page.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
    });
  }

  listAdmin() {
    return this.prisma.page.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  findBySlugAdmin(slug: string) {
    return this.prisma.page.findUnique({ where: { slug } });
  }

  async create(data: Prisma.PageCreateInput) {
    return this.prisma.page.create({ data });
  }

  async update(slug: string, data: Prisma.PageUpdateInput) {
    const page = await this.prisma.page.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException();
    return this.prisma.page.update({ where: { slug }, data });
  }

  async remove(slug: string) {
    await this.prisma.page.delete({ where: { slug } });
  }
}
