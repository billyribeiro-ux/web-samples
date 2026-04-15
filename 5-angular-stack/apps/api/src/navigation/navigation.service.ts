import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NavigationService {
  constructor(private readonly prisma: PrismaService) {}

  getByKey(key: string) {
    return this.prisma.navigationMenu.findUnique({ where: { key } });
  }

  list() {
    return this.prisma.navigationMenu.findMany();
  }

  upsert(key: string, label: string, items: unknown) {
    return this.prisma.navigationMenu.upsert({
      where: { key },
      update: { label, items: items as object },
      create: { key, label, items: items as object },
    });
  }
}
