import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { ContentStatus } from '@prisma/client';
import { ProductsService } from './products.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

class ProductDto {
  @IsString()
  @MinLength(1)
  slug!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsInt()
  priceCents!: number;

  @IsOptional()
  @IsBoolean()
  isDigital?: boolean;

  @IsEnum(ContentStatus)
  @IsOptional()
  status?: ContentStatus;
}

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Public()
  @Get()
  list() {
    return this.products.listPublished();
  }

  @Public()
  @Get('slug/:slug')
  getOne(@Param('slug') slug: string) {
    return this.products.findPublishedBySlug(slug);
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  listAdmin() {
    return this.products.listAdmin();
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  create(@Body() dto: ProductDto) {
    return this.products.create(dto);
  }

  @Put('admin/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  update(@Param('slug') slug: string, @Body() dto: Partial<ProductDto>) {
    return this.products.update(slug, dto);
  }

  @Delete('admin/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  remove(@Param('slug') slug: string) {
    return this.products.remove(slug);
  }
}
