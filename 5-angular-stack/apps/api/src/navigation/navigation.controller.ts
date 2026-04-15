import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { IsArray, IsString } from 'class-validator';
import { NavigationService } from './navigation.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

class NavUpdateDto {
  @IsString()
  label!: string;

  @IsArray()
  items!: { label: string; path: string }[];
}

@Controller('navigation')
export class NavigationController {
  constructor(private readonly nav: NavigationService) {}

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  list() {
    return this.nav.list();
  }

  @Public()
  @Get(':key')
  getOne(@Param('key') key: string) {
    return this.nav.getByKey(key);
  }

  @Put('admin/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  update(@Param('key') key: string, @Body() dto: NavUpdateDto) {
    return this.nav.upsert(key, dto.label, dto.items);
  }
}
