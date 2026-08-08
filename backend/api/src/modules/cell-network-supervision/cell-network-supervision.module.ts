import { Module } from '@nestjs/common';

import { CellNetworkSupervisionController } from './cell-network-supervision.controller';
import { CellNetworkSupervisionService } from './cell-network-supervision.service';


@Module({
  controllers: [CellNetworkSupervisionController],
  providers: [CellNetworkSupervisionService],
})
export class CellNetworkSupervisionModule {}
