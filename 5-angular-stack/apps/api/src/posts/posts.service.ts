import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  listPublished(skip = 0, take = 20) {
    return this.prisma.post.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: { publishedAt: 'desc' },
      skip,
      take,
      include: {
        author: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });
  }

  findPublishedBySlug(slug: string) {
    return this.prisma.post.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
      include: {
        author: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });
  }

  listAdmin() {
    return this.prisma.post.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { author: true },
    });
  }

  findAdmin(slug: string) {
    return this.prisma.post.findUnique({
      where: { slug },
      include: { author: true, categories: true, tags: true },
    });
  }

  create(data: Prisma.PostCreateInput) {
    return this.prisma.post.create({ data });
  }

  async update(slug: string, data: Prisma.PostUpdateInput) {
    const p = await this.prisma.post.findUnique({ where: { slug } });
    if (!p) throw new NotFoundException();
    return this.prisma.post.update({ where: { slug }, data });
  }

  async remove(slug: string) {
    await this.prisma.post.delete({ where: { slug } });
  }
}
