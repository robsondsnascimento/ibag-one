import { Module } from '@nestjs/common';
import { CellCampusCoordinationController } from './cell-campus-coordination.controller';
import { CellCampusCoordinationService } from './cell-campus-coordination.service';

@Module({ controllers: [CellCampusCoordinationController], providers: [CellCampusCoordinationService] })
export class CellCampusCoordinationModule {}
