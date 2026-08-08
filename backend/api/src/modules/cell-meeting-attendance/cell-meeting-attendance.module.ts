import { Module } from '@nestjs/common';
import { CellMeetingAttendanceController } from './cell-meeting-attendance.controller';
import { CellMeetingAttendanceService } from './cell-meeting-attendance.service';
@Module({ controllers: [CellMeetingAttendanceController], providers: [CellMeetingAttendanceService] })
export class CellMeetingAttendanceModule {}
