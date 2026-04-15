import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { IsArray, IsEmail, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

class OrderItemDto {
  @IsString()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsInt()
  @Min(0)
  unitCents!: number;
}

class CreateOrderDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  myOrders(@CurrentUser() user: RequestUser) {
    return this.orders.listForUser(user.id);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  createCheckout(@CurrentUser() user: RequestUser, @Body() dto: CreateOrderDto) {
    return this.orders.createPending({
      userId: user.id,
      email: user.email,
      items: dto.items,
    });
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  adminList(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.orders.listAdmin(Number(skip) || 0, Number(take) || 50);
  }
}
