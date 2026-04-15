import { Injectable } from '@nestjs/common';
import type { SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  listForUser(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  upsertFromStripe(data: {
    userId: string;
    planId: string;
    stripeSubscriptionId: string;
    stripeCustomerId?: string;
    status: SubscriptionStatus;
    currentPeriodEnd?: Date;
  }) {
    return this.prisma.subscription.upsert({
      where: { stripeSubscriptionId: data.stripeSubscriptionId },
      update: {
        status: data.status,
        currentPeriodEnd: data.currentPeriodEnd,
        stripeCustomerId: data.stripeCustomerId,
      },
      create: {
        userId: data.userId,
        planId: data.planId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripeCustomerId: data.stripeCustomerId,
        status: data.status,
        currentPeriodEnd: data.currentPeriodEnd,
      },
    });
  }
}
