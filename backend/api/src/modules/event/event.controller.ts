import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { OrganizationContext } from '../../common/context/organization-context';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEventChecklistDto } from './dto/create-event-checklist.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventService } from './event.service';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventController {
  constructor(private readonly service: EventService) {}

  @Post()
  create(@Body() dto: CreateEventDto, @CurrentOrganization() context: OrganizationContext) {
    return this.service.create(dto, context);
  }

  @Get()
  findAll(
    @Query('campusId') campusId: string | undefined,
    @Query('start') start: string | undefined,
    @Query('end') end: string | undefined,
    @CurrentOrganization() context: OrganizationContext,
  ) {
    return this.service.findAll(campusId, start, end, context);
  }

  @Get('me')
  findVisibleToMe(
    @Query('start') start: string | undefined,
    @Query('end') end: string | undefined,
    @CurrentOrganization() context: OrganizationContext,
  ) {
    return this.service.findVisibleToMe(start, end, context);
  }

  @Get('google-calendar/status')
  googleCalendarStatus(@CurrentOrganization() context: OrganizationContext) {
    return this.service.googleCalendarStatus(context);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) {
    return this.service.findOne(id, context);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) {
    return this.service.approve(id, context);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) {
    return this.service.cancel(id, context);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @CurrentOrganization() context: OrganizationContext,
  ) {
    return this.service.update(id, dto, context);
  }

  @Post(':id/google-calendar/sync')
  syncGoogleCalendar(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) {
    return this.service.syncWithGoogleCalendar(id, context);
  }

  @Post(':id/checklist')
  addChecklist(
    @Param('id') id: string,
    @Body() dto: CreateEventChecklistDto,
    @CurrentOrganization() context: OrganizationContext,
  ) {
    return this.service.addChecklist(id, dto, context);
  }

  @Patch('checklist/:id/toggle')
  toggleChecklist(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) {
    return this.service.toggleChecklist(id, context);
  }
}
