import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../auth/jwt-auth.guard';

@Controller('gated')
export class GatedController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('access')
  @UseGuards(JwtAuthGuard)
  async check(@CurrentUser() user: RequestUser, @Query('slug') slug: string) {
    const rule = await this.prisma.gatedContentRule.findUnique({ where: { slug } });
    if (!rule) {
      return { allowed: true };
    }
    if (!rule.requiresSubscription) {
      return { allowed: true };
    }
    const subs = await this.prisma.subscription.findMany({
      where: {
        userId: user.id,
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
      include: { plan: true },
    });
    const allowed = subs.some((s: { plan: { slug: string; amountCents: number } }) => {
      if (!rule.minPlanSlug) return true;
      return s.plan.slug === rule.minPlanSlug || s.plan.amountCents > 0;
    });
    return { allowed };
  }
}
