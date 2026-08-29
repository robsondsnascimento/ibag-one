import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ServiceScheduleStatus } from '../../generated/prisma/client';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { OrganizationContext } from '../../common/context/organization-context';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddServiceMemberDto } from './dto/add-service-member.dto';
import { AssignServiceOperationalRoleDto } from './dto/assign-service-operational-role.dto';
import { CreateServiceAreaDto } from './dto/create-service-area.dto';
import { CreateServiceScheduleBatchDto } from './dto/create-service-schedule-batch.dto';
import { CreateServiceScheduleDto } from './dto/create-service-schedule.dto';
import { CreateServiceScheduleUnavailabilityDto } from './dto/create-service-schedule-unavailability.dto';
import { CreateServiceScheduleSwapRequestDto } from './dto/create-service-schedule-swap-request.dto';
import { CreateServiceTeamDto } from './dto/create-service-team.dto';
import { RejectServiceScheduleSwapRequestDto } from './dto/reject-service-schedule-swap-request.dto';
import { SubstituteServiceScheduleDto } from './dto/substitute-service-schedule.dto';
import { UpdateServiceMemberFunctionsDto } from './dto/update-service-member-functions.dto';
import { UpdateServiceAreaFunctionsDto } from './dto/update-service-area-functions.dto';
import { UpdateServiceScheduleStatusDto } from './dto/update-service-schedule-status.dto';
import { UpdateServiceScheduleNoteDto } from './dto/update-service-schedule-note.dto';
import { UpdateServiceAreaDto } from './dto/update-service-area.dto';
import { UpdateServiceTeamDto } from './dto/update-service-team.dto';
import { TransferServiceMembershipDto } from './dto/transfer-service-membership.dto';
import { ServiceAreaService } from './service-area.service';

@Controller('service-areas')
@UseGuards(JwtAuthGuard)
export class ServiceAreaController {
  constructor(private readonly service: ServiceAreaService) {}

  @Post() create(@Body() dto: CreateServiceAreaDto, @CurrentOrganization() context: OrganizationContext) { return this.service.create(dto, context); }
  @Get() findAll(@Query('includeInactive') includeInactive: string | undefined, @CurrentOrganization() context: OrganizationContext) { return this.service.findAll(context, includeInactive === 'true'); }
  @Get(':id') findOne(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) { return this.service.findOne(id, context); }
  @Patch('teams/:id') updateTeam(@Param('id') id: string, @Body() dto: UpdateServiceTeamDto, @CurrentOrganization() context: OrganizationContext) { return this.service.updateTeam(id, dto, context); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateServiceAreaDto, @CurrentOrganization() context: OrganizationContext) { return this.service.update(id, dto, context); }
  @Patch(':id/functions') updateFunctions(@Param('id') id: string, @Body() dto: UpdateServiceAreaFunctionsDto, @CurrentOrganization() context: OrganizationContext) { return this.service.updateFunctions(id, dto, context); }
  @Post(':id/teams') createTeam(@Param('id') id: string, @Body() dto: CreateServiceTeamDto, @CurrentOrganization() context: OrganizationContext) { return this.service.createTeam(id, dto, context); }
  @Post(':id/members') addMember(@Param('id') id: string, @Body() dto: AddServiceMemberDto, @CurrentOrganization() context: OrganizationContext) { return this.service.addMember(id, dto, context); }
  @Get(':id/schedules') findAreaSchedules(@Param('id') id: string, @Query('start') start: string | undefined, @Query('end') end: string | undefined, @Query('teamId') teamId: string | undefined, @Query('status') status: ServiceScheduleStatus | undefined, @CurrentOrganization() context: OrganizationContext) { return this.service.findAreaSchedules(id, start, end, teamId, status, context); }
  @Get(':id/unavailabilities') findAreaUnavailabilities(@Param('id') id: string, @Query('start') start: string | undefined, @Query('end') end: string | undefined, @CurrentOrganization() context: OrganizationContext) { return this.service.findAreaUnavailabilities(id, start, end, context); }
  @Post(':id/unavailabilities') createUnavailability(@Param('id') id: string, @Body() dto: CreateServiceScheduleUnavailabilityDto, @CurrentOrganization() context: OrganizationContext) { return this.service.createUnavailability(id, dto, context); }
  @Delete(':id/unavailabilities/:unavailabilityId') deleteUnavailability(@Param('id') id: string, @Param('unavailabilityId') unavailabilityId: string, @CurrentOrganization() context: OrganizationContext) { return this.service.deleteUnavailability(id, unavailabilityId, context); }
  @Get(':id/schedule-notes') findScheduleNotes(@Param('id') id: string, @Query('start') start: string | undefined, @Query('end') end: string | undefined, @CurrentOrganization() context: OrganizationContext) { return this.service.findScheduleNotes(id, start, end, context); }
  @Patch(':id/schedule-notes') updateScheduleNote(@Param('id') id: string, @Body() dto: UpdateServiceScheduleNoteDto, @CurrentOrganization() context: OrganizationContext) { return this.service.updateScheduleNote(id, dto, context); }
  @Patch('memberships/:id/end') endMembership(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) { return this.service.endMembership(id, context); }
  @Patch('memberships/:id/functions') updateMembershipFunctions(@Param('id') id: string, @Body() dto: UpdateServiceMemberFunctionsDto, @CurrentOrganization() context: OrganizationContext) { return this.service.updateMembershipFunctions(id, dto, context); }
  @Patch('memberships/:id/transfer') transferMembership(@Param('id') id: string, @Body() dto: TransferServiceMembershipDto, @CurrentOrganization() context: OrganizationContext) { return this.service.transferMembership(id, dto, context); }
  @Post('teams/:id/operational-roles') assignOperationalRole(@Param('id') id: string, @Body() dto: AssignServiceOperationalRoleDto, @CurrentOrganization() context: OrganizationContext) { return this.service.assignOperationalRole(id, dto, context); }
  @Get('teams/:id/operational-roles') findOperationalRoles(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) { return this.service.findOperationalRoles(id, context); }
  @Patch('operational-roles/:id/end') endOperationalRole(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) { return this.service.endOperationalRole(id, context); }
  @Post('teams/:id/schedules') createSchedule(@Param('id') id: string, @Body() dto: CreateServiceScheduleDto, @CurrentOrganization() context: OrganizationContext) { return this.service.createSchedule(id, dto, context); }
  @Post('teams/:id/schedules/batch') createScheduleBatch(@Param('id') id: string, @Body() dto: CreateServiceScheduleBatchDto, @CurrentOrganization() context: OrganizationContext) { return this.service.createScheduleBatch(id, dto, context); }
  @Get('teams/:id/swap-requests') findTeamScheduleSwapRequests(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) { return this.service.findTeamScheduleSwapRequests(id, context); }
  @Get('teams/:id/schedules') findSchedules(@Param('id') id: string, @Query('start') start: string | undefined, @Query('end') end: string | undefined, @CurrentOrganization() context: OrganizationContext) { return this.service.findSchedules(id, start, end, context); }
  @Get('schedules/me') findMySchedules(@Query('start') start: string | undefined, @Query('end') end: string | undefined, @CurrentOrganization() context: OrganizationContext) { return this.service.findMySchedules(start, end, context); }
  @Get('schedules/:id/history') findScheduleHistory(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) { return this.service.findScheduleHistory(id, context); }
  @Get('events/:eventId/schedules') findEventSchedules(@Param('eventId') eventId: string, @CurrentOrganization() context: OrganizationContext) { return this.service.findEventSchedules(eventId, context); }
  @Patch('schedules/:id/status') updateScheduleStatus(@Param('id') id: string, @Body() dto: UpdateServiceScheduleStatusDto, @CurrentOrganization() context: OrganizationContext) { return this.service.updateScheduleStatus(id, dto, context); }
  @Patch('schedules/:id/substitute') substituteSchedule(@Param('id') id: string, @Body() dto: SubstituteServiceScheduleDto, @CurrentOrganization() context: OrganizationContext) { return this.service.substituteSchedule(id, dto, context); }
  @Delete('schedules/:id') removeSchedule(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) { return this.service.removeSchedule(id, context); }
  @Get('schedules/:id/swap-candidates') findScheduleSwapCandidates(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) { return this.service.findScheduleSwapCandidates(id, context); }
  @Post('schedules/:id/swap-requests') createScheduleSwapRequest(@Param('id') id: string, @Body() dto: CreateServiceScheduleSwapRequestDto, @CurrentOrganization() context: OrganizationContext) { return this.service.createScheduleSwapRequest(id, dto, context); }
  @Patch('swap-requests/:id/approve') approveScheduleSwapRequest(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) { return this.service.approveScheduleSwapRequest(id, context); }
  @Patch('swap-requests/:id/reject') rejectScheduleSwapRequest(@Param('id') id: string, @Body() dto: RejectServiceScheduleSwapRequestDto, @CurrentOrganization() context: OrganizationContext) { return this.service.rejectScheduleSwapRequest(id, dto, context); }
}
