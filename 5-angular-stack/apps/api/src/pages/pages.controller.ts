import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ContentStatus } from '@prisma/client';
import { PagesService } from './pages.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

class PageDto {
  @IsString()
  @MinLength(1)
  slug!: string;

  @IsString()
  title!: string;

  @IsString()
  body!: string;

  @IsEnum(ContentStatus)
  @IsOptional()
  status?: ContentStatus;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @IsOptional()
  @IsString()
  ogImageUrl?: string;

  @IsOptional()
  @IsString()
  twitterCard?: string;
}

@Controller('pages')
export class PagesController {
  constructor(private readonly pages: PagesService) {}

  @Public()
  @Get('public')
  listPublic() {
    return this.pages.listPublic();
  }

  @Public()
  @Get('public/:slug')
  getPublic(@Param('slug') slug: string) {
    return this.pages.findBySlugPublic(slug);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  listAdmin() {
    return this.pages.listAdmin();
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  create(@Body() dto: PageDto) {
    return this.pages.create(dto);
  }

  @Put('admin/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  update(@Param('slug') slug: string, @Body() dto: Partial<PageDto>) {
    return this.pages.update(slug, dto);
  }

  @Delete('admin/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  remove(@Param('slug') slug: string) {
    return this.pages.remove(slug);
  }
}
