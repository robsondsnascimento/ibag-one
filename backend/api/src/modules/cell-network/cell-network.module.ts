import { Module } from '@nestjs/common';

import {
  CellNetworkController,
} from './cell-network.controller';

import {
  CellNetworkService,
} from './cell-network.service';


@Module({
  controllers: [
    CellNetworkController,
  ],
  providers: [
    CellNetworkService,
  ],
})
export class CellNetworkModule {}
