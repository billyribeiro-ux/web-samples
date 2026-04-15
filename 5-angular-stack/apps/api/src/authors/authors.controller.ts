import { Controller, Get, Param } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authors: AuthorsService) {}

  @Public()
  @Get()
  list() {
    return this.authors.list();
  }

  @Public()
  @Get(':slug')
  getOne(@Param('slug') slug: string) {
    return this.authors.findBySlug(slug);
  }
}
