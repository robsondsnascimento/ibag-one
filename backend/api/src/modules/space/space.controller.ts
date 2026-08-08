import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { OrganizationContext } from '../../common/context/organization-context';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSpaceDto } from './dto/create-space.dto';
import { SpaceService } from './space.service';
@Controller('spaces') @UseGuards(JwtAuthGuard)
export class SpaceController { constructor(private readonly service: SpaceService) {} @Post() create(@Body() dto: CreateSpaceDto, @CurrentOrganization() context: OrganizationContext) { return this.service.create(dto, context); } @Get() findAll(@Query('campusId') campusId: string | undefined, @CurrentOrganization() context: OrganizationContext) { return this.service.findAll(campusId, context); } }
