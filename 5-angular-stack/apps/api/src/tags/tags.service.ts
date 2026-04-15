import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.tag.findMany({ orderBy: { name: 'asc' } });
  }

  findBySlug(slug: string) {
    return this.prisma.tag.findUnique({
      where: { slug },
      include: {
        posts: {
          where: { post: { status: ContentStatus.PUBLISHED } },
          include: {
            post: {
              include: { author: true },
            },
          },
        },
      },
    });
  }
}
