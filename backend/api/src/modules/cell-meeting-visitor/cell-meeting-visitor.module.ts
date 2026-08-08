import { Module } from '@nestjs/common';
import { CellMeetingVisitorController } from './cell-meeting-visitor.controller';
import { CellMeetingVisitorService } from './cell-meeting-visitor.service';
@Module({ controllers: [CellMeetingVisitorController], providers: [CellMeetingVisitorService] }) export class CellMeetingVisitorModule {}
