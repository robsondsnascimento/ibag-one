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
import { CellNetworkSupervisionService } from './cell-network-supervision.service';
import { CreateCellNetworkSupervisionDto } from './dto/create-cell-network-supervision.dto';
import { TransferCellNetworkSupervisionDto } from './dto/transfer-cell-network-supervision.dto';


@Controller('cell-network-supervisions')
@UseGuards(JwtAuthGuard)
export class CellNetworkSupervisionController {

  constructor(
    private readonly supervisionService: CellNetworkSupervisionService,
  ) {}


  @Post()
  create(
    @Body() dto: CreateCellNetworkSupervisionDto,
    @CurrentOrganization() context: OrganizationContext,
  ) {

    return this.supervisionService.create(dto, context);

  }


  @Get()
  findAll(@CurrentOrganization() context: OrganizationContext) {

    return this.supervisionService.findAll(context);

  }


  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentOrganization() context: OrganizationContext,
  ) {

    return this.supervisionService.findOne(id, context);

  }


  @Patch(':id/end')
  end(
    @Param('id') id: string,
    @CurrentOrganization() context: OrganizationContext,
  ) {

    return this.supervisionService.end(id, context);

  }


  @Patch(':id/transfer')
  transfer(
    @Param('id') id: string,
    @Body() dto: TransferCellNetworkSupervisionDto,
    @CurrentOrganization() context: OrganizationContext,
  ) {

    return this.supervisionService.transfer(
      id,
      dto.networkId,
      context,
    );

  }

}
