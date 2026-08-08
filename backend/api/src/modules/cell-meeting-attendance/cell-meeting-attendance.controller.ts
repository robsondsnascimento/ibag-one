import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { OrganizationContext } from '../../common/context/organization-context';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CellMeetingAttendanceService } from './cell-meeting-attendance.service';
import { CreateCellMeetingAttendanceDto } from './dto/create-cell-meeting-attendance.dto';
import { SaveCellMeetingRosterDto } from './dto/save-cell-meeting-roster.dto';
@Controller('cell-meeting-attendances') @UseGuards(JwtAuthGuard)
export class CellMeetingAttendanceController {
  constructor(private readonly service: CellMeetingAttendanceService) {}
  @Post() create(@Body() dto: CreateCellMeetingAttendanceDto, @CurrentOrganization() context: OrganizationContext) { return this.service.create(dto, context); }
  @Get('meeting/:meetingId') findByMeeting(@Param('meetingId') meetingId: string, @CurrentOrganization() context: OrganizationContext) { return this.service.findByMeeting(meetingId, context); }
  @Get('meeting/:meetingId/roster') findRoster(@Param('meetingId') meetingId: string, @CurrentOrganization() context: OrganizationContext) { return this.service.findRoster(meetingId, context); }
  @Put('meeting/:meetingId/roster') saveRoster(@Param('meetingId') meetingId: string, @Body() dto: SaveCellMeetingRosterDto, @CurrentOrganization() context: OrganizationContext) { return this.service.saveRoster(meetingId, dto, context); }
}
