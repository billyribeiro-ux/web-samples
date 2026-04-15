import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthorsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.author.findMany({ orderBy: { name: 'asc' } });
  }

  findBySlug(slug: string) {
    return this.prisma.author.findUnique({
      where: { slug },
      include: {
        posts: {
          where: { status: ContentStatus.PUBLISHED },
          orderBy: { publishedAt: 'desc' },
        },
      },
    });
  }
}
