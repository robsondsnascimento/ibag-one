import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CellMembershipService } from './cell-membership.service';

import {
  CreateCellMembershipDto,
} from './dto/create-cell-membership.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import {
  CurrentOrganization,
} from '../../common/decorators/current-organization.decorator';

import {
  OrganizationContext,
} from '../../common/context/organization-context';


@Controller('cell-memberships')
@UseGuards(JwtAuthGuard)
export class CellMembershipController {

  constructor(
    private readonly cellMembershipService:
      CellMembershipService,
  ) {}


  @Post()
  create(
    @Body()
    createCellMembershipDto:
      CreateCellMembershipDto,

    @CurrentOrganization()
    context: OrganizationContext,
  ) {

    return this.cellMembershipService.create(
      createCellMembershipDto,
      context,
    );

  }


  @Get()
  findAll(
    @CurrentOrganization()
    context: OrganizationContext,
  ) {

    return this.cellMembershipService.findAll(
      context,
    );

  }

}
