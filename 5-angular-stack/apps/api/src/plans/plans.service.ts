import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  listActive() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { amountCents: 'asc' },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.plan.findUnique({ where: { slug } });
  }
}
