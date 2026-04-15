import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ContentStatus } from '@prisma/client';
import { PostsService } from './posts.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

class PostDto {
  @IsString()
  @MinLength(1)
  slug!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsString()
  body!: string;

  @IsEnum(ContentStatus)
  @IsOptional()
  status?: ContentStatus;

  @IsString()
  authorId!: string;

  @IsOptional()
  @Type(() => Date)
  publishedAt?: Date;

  @IsOptional()
  @IsInt()
  readingMinutes?: number;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;
}

@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Public()
  @Get()
  list(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.posts.listPublished(Number(skip) || 0, Number(take) || 20);
  }

  @Public()
  @Get('slug/:slug')
  getOne(@Param('slug') slug: string) {
    return this.posts.findPublishedBySlug(slug);
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  listAdmin() {
    return this.posts.listAdmin();
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  create(@Body() dto: PostDto) {
    return this.posts.create({
      slug: dto.slug,
      title: dto.title,
      excerpt: dto.excerpt,
      body: dto.body,
      status: dto.status ?? ContentStatus.DRAFT,
      publishedAt: dto.publishedAt,
      readingMinutes: dto.readingMinutes,
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      author: { connect: { id: dto.authorId } },
    });
  }

  @Put('admin/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  update(@Param('slug') slug: string, @Body() dto: Partial<PostDto>) {
    const { authorId, ...rest } = dto;
    return this.posts.update(slug, {
      ...rest,
      ...(authorId ? { author: { connect: { id: authorId } } } : {}),
    });
  }

  @Delete('admin/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  remove(@Param('slug') slug: string) {
    return this.posts.remove(slug);
  }
}
