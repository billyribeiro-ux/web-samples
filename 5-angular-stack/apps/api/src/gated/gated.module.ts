import { Module } from '@nestjs/common';
import { GatedController } from './gated.controller';

@Module({
  controllers: [GatedController],
})
export class GatedModule {}
