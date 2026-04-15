import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  getSite() {
    return this.prisma.siteSetting.findUnique({ where: { key: 'site' } });
  }

  upsertSite(value: object) {
    return this.prisma.siteSetting.upsert({
      where: { key: 'site' },
      update: { value },
      create: { key: 'site', value },
    });
  }
}
