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

import { CellService } from './cell.service';

import { CreateCellDto } from './dto/create-cell.dto';
import { UpdateCellDto } from './dto/update-cell.dto';
import { UpdateCellStatusDto } from './dto/update-cell-status.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import {
  CurrentOrganization,
} from '../../common/decorators/current-organization.decorator';

import {
  OrganizationContext,
} from '../../common/context/organization-context';


@Controller('cells')
@UseGuards(JwtAuthGuard)
export class CellController {

  constructor(
    private readonly cellService: CellService,
  ) {}


  @Post()
  create(
    @Body() createCellDto: CreateCellDto,
    @CurrentOrganization()
    context: OrganizationContext,
  ) {

    return this.cellService.create(
      createCellDto,
      context,
    );

  }


  @Get()
  findAll(
    @CurrentOrganization()
    context: OrganizationContext,
  ) {

    return this.cellService.findAll(
      context,
    );

  }


  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentOrganization()
    context: OrganizationContext,
  ) {

    return this.cellService.findOne(
      id,
      context,
    );

  }


  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCellDto: UpdateCellDto,
    @CurrentOrganization()
    context: OrganizationContext,
  ) {

    return this.cellService.update(
      id,
      updateCellDto,
      context,
    );

  }


  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentOrganization()
    context: OrganizationContext,
  ) {

    return this.cellService.remove(
      id,
      context,
    );

  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateCellStatusDto, @CurrentOrganization() context: OrganizationContext) { return this.cellService.updateStatus(id, dto.status, context); }

}
