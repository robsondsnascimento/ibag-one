import { Module } from '@nestjs/common';
import { WorshipOrderController } from './worship-order.controller';
import { WorshipOrderService } from './worship-order.service';

@Module({
  controllers: [WorshipOrderController],
  providers: [WorshipOrderService],
})
export class WorshipOrderModule {}
