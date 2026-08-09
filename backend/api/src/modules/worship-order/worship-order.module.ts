import { Module } from '@nestjs/common';
import { WorshipOrderController } from './worship-order.controller';
import { WorshipOrderService } from './worship-order.service';
import { WorshipOrderTemplateModule } from '../worship-order-template/worship-order-template.module';
import { WorshipOrderPdfService } from './worship-order-pdf.service';

@Module({
  imports: [WorshipOrderTemplateModule],
  controllers: [WorshipOrderController],
  providers: [WorshipOrderService, WorshipOrderPdfService],
})
export class WorshipOrderModule {}
