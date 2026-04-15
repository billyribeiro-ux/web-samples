import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../auth/jwt-auth.guard';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async list(@CurrentUser() user: RequestUser) {
    return this.prisma.favorite.findMany({
      where: { userId: user.id },
      include: { product: true },
    });
  }

  @Post('me/:productId')
  @UseGuards(JwtAuthGuard)
  async add(@CurrentUser() user: RequestUser, @Param('productId') productId: string) {
    return this.prisma.favorite.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      update: {},
      create: { userId: user.id, productId },
    });
  }

  @Delete('me/:productId')
  @UseGuards(JwtAuthGuard)
  async remove(@CurrentUser() user: RequestUser, @Param('productId') productId: string) {
    await this.prisma.favorite.deleteMany({
      where: { userId: user.id, productId },
    });
    return { ok: true };
  }
}
