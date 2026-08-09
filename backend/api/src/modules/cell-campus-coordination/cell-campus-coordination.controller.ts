import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { OrganizationContext } from '../../common/context/organization-context';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CellCampusCoordinationService } from './cell-campus-coordination.service';
import { CreateCellCampusCoordinationDto } from './dto/create-cell-campus-coordination.dto';
import { TransferCellCampusCoordinationDto } from './dto/transfer-cell-campus-coordination.dto';

@Controller('cell-campus-coordinations')
@UseGuards(JwtAuthGuard)
export class CellCampusCoordinationController {
  constructor(private readonly service: CellCampusCoordinationService) {}

  @Post() create(@Body() dto: CreateCellCampusCoordinationDto, @CurrentOrganization() context: OrganizationContext) { return this.service.create(dto, context); }
  @Get() findAll(@CurrentOrganization() context: OrganizationContext) { return this.service.findAll(context); }
  @Get(':id') findOne(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) { return this.service.findOne(id, context); }
  @Patch(':id/end') end(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) { return this.service.end(id, context); }
  @Patch(':id/transfer') transfer(@Param('id') id: string, @Body() dto: TransferCellCampusCoordinationDto, @CurrentOrganization() context: OrganizationContext) { return this.service.transfer(id, dto, context); }
}
