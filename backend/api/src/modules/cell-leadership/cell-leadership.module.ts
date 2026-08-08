import { Module } from '@nestjs/common';

import {
  CellLeadershipService,
} from './cell-leadership.service';

import {
  CellLeadershipController,
} from './cell-leadership.controller';


@Module({
  controllers: [
    CellLeadershipController,
  ],
  providers: [
    CellLeadershipService,
  ],
})
export class CellLeadershipModule {}
