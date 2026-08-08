import { Module } from '@nestjs/common';

import {
  CellMembershipService,
} from './cell-membership.service';

import {
  CellMembershipController,
} from './cell-membership.controller';


@Module({

  controllers: [
    CellMembershipController,
  ],

  providers: [
    CellMembershipService,
  ],

})
export class CellMembershipModule {}
