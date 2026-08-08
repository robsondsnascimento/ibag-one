import { Module } from '@nestjs/common';
import { CellLocationController } from './cell-location.controller';
import { CellLocationService } from './cell-location.service';
@Module({ controllers: [CellLocationController], providers: [CellLocationService] }) export class CellLocationModule {}
