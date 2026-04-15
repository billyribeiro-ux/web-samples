import { Controller, Get, Param } from '@nestjs/common';
import { TagsService } from './tags.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('tags')
export class TagsController {
  constructor(private readonly tags: TagsService) {}

  @Public()
  @Get()
  list() {
    return this.tags.list();
  }

  @Public()
  @Get(':slug')
  getOne(@Param('slug') slug: string) {
    return this.tags.findBySlug(slug);
  }
}
