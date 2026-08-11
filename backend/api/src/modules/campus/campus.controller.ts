import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { OrganizationContext } from '../../common/context/organization-context';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CampusService } from './campus.service';

@Controller('campuses')
@UseGuards(JwtAuthGuard)
export class CampusController {

  constructor(
    private readonly campusService: CampusService,
  ) {}

  @Get()
  findAll(@CurrentOrganization() context: OrganizationContext) {
    return this.campusService.findAll(context);
  }

  @Post()
  create(
    @Body() data: {
      nome: string;
      cidade: string;
      estado: string;
    },
  ) {
    return this.campusService.create(data);
  }
}
