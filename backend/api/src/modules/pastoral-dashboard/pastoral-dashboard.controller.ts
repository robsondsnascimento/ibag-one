import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { OrganizationContext } from '../../common/context/organization-context';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PastoralDashboardService } from './pastoral-dashboard.service';
@Controller('pastoral-dashboard') @UseGuards(JwtAuthGuard)
export class PastoralDashboardController { constructor(private readonly service: PastoralDashboardService) {} @Get('overview') overview(@CurrentOrganization() context: OrganizationContext) { return this.service.overview(context); } @Get('geography') geography(@CurrentOrganization() context: OrganizationContext) { return this.service.geography(context); } @Get('cells') cells(@CurrentOrganization() context: OrganizationContext) { return this.service.cells(context); } }
