import { Module } from '@nestjs/common';
import { WorshipOrderTemplateController } from './worship-order-template.controller';
import { WorshipOrderTemplateService } from './worship-order-template.service';

@Module({
  controllers: [WorshipOrderTemplateController],
  providers: [WorshipOrderTemplateService],
  exports: [WorshipOrderTemplateService],
})
export class WorshipOrderTemplateModule {}
