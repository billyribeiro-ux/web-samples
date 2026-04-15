import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  listForUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    });
  }

  createPending(data: {
    userId?: string;
    email?: string;
    items: { productId: string; quantity: number; unitCents: number }[];
    stripeSessionId?: string;
  }) {
    const totalCents = data.items.reduce(
      (s, i) => s + i.unitCents * i.quantity,
      0,
    );
    return this.prisma.order.create({
      data: {
        userId: data.userId,
        email: data.email,
        status: OrderStatus.PENDING,
        totalCents,
        stripeSessionId: data.stripeSessionId,
        items: {
          create: data.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitCents: i.unitCents,
          })),
        },
      },
      include: { items: true },
    });
  }

  async markPaidBySession(stripeSessionId: string, paymentId?: string) {
    return this.prisma.order.updateMany({
      where: { stripeSessionId },
      data: {
        status: OrderStatus.PAID,
        stripePaymentId: paymentId,
      },
    });
  }

  listAdmin(skip = 0, take = 50) {
    return this.prisma.order.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { user: true, items: { include: { product: true } } },
    });
  }
}
