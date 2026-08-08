import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  CurrentOrganization,
} from '../../common/decorators/current-organization.decorator';

import {
  OrganizationContext,
} from '../../common/context/organization-context';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CellNetworkService } from './cell-network.service';

import {
  CreateCellNetworkDto,
} from './dto/create-cell-network.dto';

import {
  UpdateCellNetworkDto,
} from './dto/update-cell-network.dto';


@Controller('cell-networks')
@UseGuards(JwtAuthGuard)
export class CellNetworkController {

  constructor(
    private readonly cellNetworkService: CellNetworkService,
  ) {}


  @Post()
  create(
    @Body() dto: CreateCellNetworkDto,
    @CurrentOrganization() context: OrganizationContext,
  ) {

    return this.cellNetworkService.create(dto, context);

  }


  @Get()
  findAll(
    @CurrentOrganization() context: OrganizationContext,
  ) {

    return this.cellNetworkService.findAll(context);

  }


  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentOrganization() context: OrganizationContext,
  ) {

    return this.cellNetworkService.findOne(id, context);

  }


  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCellNetworkDto,
    @CurrentOrganization() context: OrganizationContext,
  ) {

    return this.cellNetworkService.update(id, dto, context);

  }


  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentOrganization() context: OrganizationContext,
  ) {

    return this.cellNetworkService.remove(id, context);

  }


  @Patch(':id/cells/:cellId')
  assignCell(
    @Param('id') id: string,
    @Param('cellId') cellId: string,
    @CurrentOrganization() context: OrganizationContext,
  ) {

    return this.cellNetworkService.assignCell(
      id,
      cellId,
      context,
    );

  }


  @Delete(':id/cells/:cellId')
  unassignCell(
    @Param('id') id: string,
    @Param('cellId') cellId: string,
    @CurrentOrganization() context: OrganizationContext,
  ) {

    return this.cellNetworkService.unassignCell(
      id,
      cellId,
      context,
    );

  }

}
