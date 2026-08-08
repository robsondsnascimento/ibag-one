import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { OrganizationContext } from '../../common/context/organization-context';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CellMeetingService } from './cell-meeting.service';
import { CreateCellMeetingDto } from './dto/create-cell-meeting.dto';

@Controller('cell-meetings')
@UseGuards(JwtAuthGuard)
export class CellMeetingController {
  constructor(private readonly service: CellMeetingService) {}

  @Post()
  create(
    @Body() dto: CreateCellMeetingDto,
    @CurrentOrganization() context: OrganizationContext,
  ) {
    return this.service.create(dto, context);
  }

  @Get()
  findAll(@CurrentOrganization() context: OrganizationContext) {
    return this.service.findAll(context);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentOrganization() context: OrganizationContext,
  ) {
    return this.service.findOne(id, context);
  }

  @Patch(':id/close')
  close(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) {
    return this.service.close(id, context);
  }
}
