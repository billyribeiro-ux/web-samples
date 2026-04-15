import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Public()
  @Get()
  query(@Query('q') q = '', @Query('limit') limit?: string) {
    return this.search.search(q, Number(limit) || 20);
  }
}
