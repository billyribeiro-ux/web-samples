import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { IsObject } from 'class-validator';
import { SettingsService } from './settings.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

class SiteDto {
  @IsObject()
  value!: Record<string, unknown>;
}

@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Public()
  @Get('site')
  site() {
    return this.settings.getSite();
  }

  @Put('admin/site')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  updateSite(@Body() dto: SiteDto) {
    return this.settings.upsertSite(dto.value);
  }
}
