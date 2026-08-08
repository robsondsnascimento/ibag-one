import { Module } from '@nestjs/common';

import { CellService } from './cell.service';
import { CellController } from './cell.controller';


@Module({
  controllers: [
    CellController,
  ],

  providers: [
    CellService,
  ],
})
export class CellModule {}
