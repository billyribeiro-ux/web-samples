import { Body, Controller, Post } from '@nestjs/common';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { Public } from '../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

class AnalyticsEventDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsObject()
  properties?: Record<string, unknown>;
}

@Controller('analytics')
export class AnalyticsController {
  @Public()
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @Post('event')
  ingest(@Body() dto: AnalyticsEventDto) {
    return { ok: true, received: dto.name };
  }
}
