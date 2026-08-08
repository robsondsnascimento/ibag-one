import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { OrganizationContext } from '../../common/context/organization-context';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddServiceMemberDto } from './dto/add-service-member.dto';
import { CreateServiceAreaDto } from './dto/create-service-area.dto';
import { CreateServiceScheduleDto } from './dto/create-service-schedule.dto';
import { CreateServiceTeamDto } from './dto/create-service-team.dto';
import { UpdateServiceScheduleStatusDto } from './dto/update-service-schedule-status.dto';
import { ServiceAreaService } from './service-area.service';

@Controller('service-areas')
@UseGuards(JwtAuthGuard)
export class ServiceAreaController {
  constructor(private readonly service: ServiceAreaService) {}

  @Post() create(@Body() dto: CreateServiceAreaDto, @CurrentOrganization() context: OrganizationContext) { return this.service.create(dto, context); }
  @Get() findAll(@CurrentOrganization() context: OrganizationContext) { return this.service.findAll(context); }
  @Get(':id') findOne(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) { return this.service.findOne(id, context); }
  @Post(':id/teams') createTeam(@Param('id') id: string, @Body() dto: CreateServiceTeamDto, @CurrentOrganization() context: OrganizationContext) { return this.service.createTeam(id, dto, context); }
  @Post(':id/members') addMember(@Param('id') id: string, @Body() dto: AddServiceMemberDto, @CurrentOrganization() context: OrganizationContext) { return this.service.addMember(id, dto, context); }
  @Patch('memberships/:id/end') endMembership(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) { return this.service.endMembership(id, context); }
  @Post('teams/:id/schedules') createSchedule(@Param('id') id: string, @Body() dto: CreateServiceScheduleDto, @CurrentOrganization() context: OrganizationContext) { return this.service.createSchedule(id, dto, context); }
  @Get('teams/:id/schedules') findSchedules(@Param('id') id: string, @Query('start') start: string | undefined, @Query('end') end: string | undefined, @CurrentOrganization() context: OrganizationContext) { return this.service.findSchedules(id, start, end, context); }
  @Patch('schedules/:id/status') updateScheduleStatus(@Param('id') id: string, @Body() dto: UpdateServiceScheduleStatusDto, @CurrentOrganization() context: OrganizationContext) { return this.service.updateScheduleStatus(id, dto, context); }
}
