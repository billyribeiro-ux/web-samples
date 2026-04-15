import { Controller, Get, Param } from '@nestjs/common';
import { PlansService } from './plans.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('plans')
export class PlansController {
  constructor(private readonly plans: PlansService) {}

  @Public()
  @Get()
  list() {
    return this.plans.listActive();
  }

  @Public()
  @Get(':slug')
  getOne(@Param('slug') slug: string) {
    return this.plans.findBySlug(slug);
  }
}
