import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { OrganizationContext } from '../../common/context/organization-context';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthorizeKidsPickupDto } from './dto/authorize-kids-pickup.dto';
import { AssignKidsOperationalRoleDto } from './dto/assign-kids-operational-role.dto';
import { CreateKidsChildDto } from './dto/create-kids-child.dto';
import { CreateKidsClassDto } from './dto/create-kids-class.dto';
import { EnrollKidDto } from './dto/enroll-kid.dto';
import { KidsCheckInDto } from './dto/kids-check-in.dto';
import { ScanKidsQrDto } from './dto/scan-kids-qr.dto';
import { UpsertKidsCareProfileDto } from './dto/upsert-kids-care-profile.dto';
import { KidsService } from './kids.service';

@Controller('kids') @UseGuards(JwtAuthGuard)
export class KidsController {
  constructor(private readonly service: KidsService) {}
  @Post('operational-roles') assignRole(@Body() dto: AssignKidsOperationalRoleDto, @CurrentOrganization() c: OrganizationContext) { return this.service.assignOperationalRole(dto, c); }
  @Post('children') createChild(@Body() dto: CreateKidsChildDto, @CurrentOrganization() c: OrganizationContext) { return this.service.createChild(dto, c); }
  @Get('children/:id/care-profile') careProfile(@Param('id') id: string, @CurrentOrganization() c: OrganizationContext) { return this.service.careProfile(id, c); }
  @Post('children/:id/care-profile') upsertCareProfile(@Param('id') id: string, @Body() dto: UpsertKidsCareProfileDto, @CurrentOrganization() c: OrganizationContext) { return this.service.upsertCareProfile(id, dto, c); }
  @Post('classes') createClass(@Body() dto: CreateKidsClassDto, @CurrentOrganization() c: OrganizationContext) { return this.service.createClass(dto, c); }
  @Get('classes') classes(@CurrentOrganization() c: OrganizationContext) { return this.service.classes(c); }
  @Post('classes/:id/enrollments') enroll(@Param('id') id: string, @Body() dto: EnrollKidDto, @CurrentOrganization() c: OrganizationContext) { return this.service.enroll(id, dto, c); }
  @Post('children/:id/authorized-pickups') authorizePickup(@Param('id') id: string, @Body() dto: AuthorizeKidsPickupDto, @CurrentOrganization() c: OrganizationContext) { return this.service.authorizePickup(id, dto, c); }
  @Post('check-ins') checkIn(@Body() dto: KidsCheckInDto, @CurrentOrganization() c: OrganizationContext) { return this.service.checkIn(dto, c); }
  @Post('check-ins/scan') scanCheckIn(@Body() dto: ScanKidsQrDto, @CurrentOrganization() c: OrganizationContext) { return this.service.scanCheckIn(dto, c); }
  @Post('check-ins/:id/check-out') checkOut(@Param('id') id: string, @Body() dto: KidsCheckInDto, @CurrentOrganization() c: OrganizationContext) { return this.service.checkOut(id, dto, c); }
  @Post('check-outs/scan') scanCheckOut(@Body() dto: ScanKidsQrDto, @CurrentOrganization() c: OrganizationContext) { return this.service.scanCheckOut(dto, c); }
  @Get('check-ins/open') open(@CurrentOrganization() c: OrganizationContext) { return this.service.openCheckIns(c); }
  @Get('worship-events/:id/overview') worshipOverview(@Param('id') id: string, @CurrentOrganization() c: OrganizationContext) { return this.service.worshipOverview(id, c); }
}
