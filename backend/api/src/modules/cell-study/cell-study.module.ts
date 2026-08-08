import { Module } from '@nestjs/common';
import { CellStudyController } from './cell-study.controller';
import { CellStudyService } from './cell-study.service';
@Module({ controllers: [CellStudyController], providers: [CellStudyService] }) export class CellStudyModule {}
