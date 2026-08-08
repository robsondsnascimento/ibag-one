import { Module } from '@nestjs/common';
import { CellMeetingController } from './cell-meeting.controller';
import { CellMeetingService } from './cell-meeting.service';

@Module({
  controllers: [CellMeetingController],
  providers: [CellMeetingService],
})
export class CellMeetingModule {}
