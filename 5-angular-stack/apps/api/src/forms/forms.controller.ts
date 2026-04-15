import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { FormType } from '@prisma/client';
import { IsEmail, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { FormsService } from './forms.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Throttle } from '@nestjs/throttler';

class ContactDto {
  @IsEmail()
  email!: string;

  @IsString()
  name!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  company?: string;

  /** Honeypot — must stay empty (bots often fill hidden fields). */
  @IsOptional()
  @IsString()
  website?: string;
}

class NewsletterDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  source?: string;
}

@Controller('forms')
export class FormsController {
  constructor(private readonly forms: FormsService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('contact')
  contact(@Body() dto: ContactDto, @Req() req: Request) {
    if (dto.website != null && String(dto.website).trim() !== '') {
      throw new BadRequestException();
    }
    return this.forms.submit({
      type: FormType.CONTACT,
      email: dto.email,
      name: dto.name,
      payload: { message: dto.message, company: dto.company },
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('newsletter')
  newsletter(@Body() dto: NewsletterDto) {
    return this.forms.newsletter(dto.email, dto.source);
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  adminList(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.forms.listAdmin(Number(skip) || 0, Number(take) || 50);
  }
}
