import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { OrganizationContext } from '../../common/context/organization-context';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePastoralCareDto } from './dto/create-pastoral-care.dto';
import { PastoralCareService } from './pastoral-care.service';
@Controller('pastoral-cares') @UseGuards(JwtAuthGuard)
export class PastoralCareController { constructor(private readonly service: PastoralCareService) {} @Post() create(@Body() dto: CreatePastoralCareDto, @CurrentOrganization() context: OrganizationContext) { return this.service.create(dto, context); } @Get('person/:personId') findForSubject(@Param('personId') personId: string, @CurrentOrganization() context: OrganizationContext) { return this.service.findForSubject(personId, context); } @Patch(':id/complete') complete(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) { return this.service.complete(id, context); } }
