import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { OrganizationContext } from '../../common/context/organization-context';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CellLocationService } from './cell-location.service';
import { UpsertCellLocationDto } from './dto/upsert-cell-location.dto';
@Controller('cell-locations') @UseGuards(JwtAuthGuard)
export class CellLocationController { constructor(private readonly service: CellLocationService) {} @Put(':cellId') upsert(@Param('cellId') cellId: string, @Body() dto: UpsertCellLocationDto, @CurrentOrganization() context: OrganizationContext) { return this.service.upsert(cellId, dto, context); } @Get(':cellId') findOne(@Param('cellId') cellId: string, @CurrentOrganization() context: OrganizationContext) { return this.service.findOne(cellId, context); } }
