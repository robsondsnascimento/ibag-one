import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CellLeadershipService } from './cell-leadership.service';

import {
  CreateCellLeadershipDto,
} from './dto/create-cell-leadership.dto';

import {
  TransferCellLeadershipDto,
} from './dto/transfer-cell-leadership.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import {
  CurrentOrganization,
} from '../../common/decorators/current-organization.decorator';

import {
  OrganizationContext,
} from '../../common/context/organization-context';


@Controller('cell-leaderships')
@UseGuards(JwtAuthGuard)
export class CellLeadershipController {

  constructor(
    private readonly cellLeadershipService:
      CellLeadershipService,
  ) {}


  @Post()
  create(
    @Body()
    createCellLeadershipDto:
      CreateCellLeadershipDto,

    @CurrentOrganization()
    context: OrganizationContext,
  ) {

    return this.cellLeadershipService.create(
      createCellLeadershipDto,
      context,
    );

  }


  @Get()
  findAll(
    @CurrentOrganization()
    context: OrganizationContext,
  ) {

    return this.cellLeadershipService.findAll(
      context,
    );

  }


  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentOrganization()
    context: OrganizationContext,
  ) {

    return this.cellLeadershipService.findOne(
      id,
      context,
    );

  }


  @Patch(':id/end')
  end(
    @Param('id') id: string,
    @CurrentOrganization()
    context: OrganizationContext,
  ) {

    return this.cellLeadershipService.end(
      id,
      context,
    );

  }


  @Patch(':id/transfer')
  transfer(
    @Param('id') id: string,
    @Body() transferCellLeadershipDto: TransferCellLeadershipDto,
    @CurrentOrganization()
    context: OrganizationContext,
  ) {

    return this.cellLeadershipService.transfer(
      id,
      transferCellLeadershipDto.cellId,
      context,
    );

  }

}
