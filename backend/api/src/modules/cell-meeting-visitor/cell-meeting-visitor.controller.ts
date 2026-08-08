import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { OrganizationContext } from '../../common/context/organization-context';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CellMeetingVisitorService } from './cell-meeting-visitor.service';
import { CreateCellMeetingVisitorDto } from './dto/create-cell-meeting-visitor.dto';
@Controller('cell-meeting-visitors') @UseGuards(JwtAuthGuard)
export class CellMeetingVisitorController { constructor(private readonly service: CellMeetingVisitorService) {} @Post() create(@Body() dto: CreateCellMeetingVisitorDto, @CurrentOrganization() context: OrganizationContext) { return this.service.create(dto, context); } @Get('meeting/:meetingId') findByMeeting(@Param('meetingId') meetingId: string, @CurrentOrganization() context: OrganizationContext) { return this.service.findByMeeting(meetingId, context); } @Patch(':id/convert-to-person') convertToPerson(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) { return this.service.convertToPerson(id, context); } @Patch(':id/convert-to-member') convertToMember(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) { return this.service.convertToMember(id, context); } @Delete(':id') remove(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) { return this.service.remove(id, context); } }
