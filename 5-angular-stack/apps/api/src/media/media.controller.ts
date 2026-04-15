import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

class PresignDto {
  @IsString()
  mimeType!: string;

  @IsInt()
  @Min(1)
  @Max(20_000_000)
  sizeBytes!: number;
}

class FinalizeDto {
  @IsString()
  key!: string;

  @IsString()
  mimeType!: string;

  @IsInt()
  sizeBytes!: number;

  @IsOptional()
  @IsString()
  altText?: string;
}

@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post('presign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  presign(@Body() dto: PresignDto) {
    return this.media.createPresignedUpload(dto.mimeType, dto.sizeBytes);
  }

  @Post('finalize')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  finalize(@Body() dto: FinalizeDto) {
    return this.media.finalize(dto.key, dto.mimeType, dto.sizeBytes, dto.altText);
  }

  @Get('library')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  library() {
    return this.media.list();
  }
}
