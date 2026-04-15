import { Injectable } from '@nestjs/common';
import { FormType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FormsService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(data: {
    type: FormType;
    email?: string;
    name?: string;
    payload: Prisma.InputJsonValue;
    userId?: string;
    ip?: string;
    userAgent?: string;
  }) {
    const { userId, ...rest } = data;
    return this.prisma.formSubmission.create({
      data: {
        ...rest,
        ...(userId ? { user: { connect: { id: userId } } } : {}),
      },
    });
  }

  listAdmin(skip = 0, take = 50) {
    return this.prisma.formSubmission.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async newsletter(email: string, source?: string) {
    return this.prisma.newsletterLead.upsert({
      where: { email },
      update: { source },
      create: { email, source },
    });
  }
}
