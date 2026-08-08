import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { OrganizationContext } from '../../common/context/organization-context';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthorizeKidsPickupDto } from './dto/authorize-kids-pickup.dto';
import { AssignKidsOperationalRoleDto } from './dto/assign-kids-operational-role.dto';
import { TransferKidsOperationalRoleDto } from './dto/transfer-kids-operational-role.dto';
import { CreateKidsChildDto } from './dto/create-kids-child.dto';
import { CreateKidsClassDto } from './dto/create-kids-class.dto';
import { EnrollKidDto } from './dto/enroll-kid.dto';
import { KidsCheckInDto } from './dto/kids-check-in.dto';
import { ScanKidsQrDto } from './dto/scan-kids-qr.dto';
import { UpsertKidsCareProfileDto } from './dto/upsert-kids-care-profile.dto';
import { CreateKidsPreCheckInDto } from './dto/create-kids-pre-checkin.dto';
import { KidsService } from './kids.service';

@Controller('kids') @UseGuards(JwtAuthGuard)
export class KidsController {
  constructor(private readonly service: KidsService) {}
  @Post('operational-roles') assignRole(@Body() dto: AssignKidsOperationalRoleDto, @CurrentOrganization() c: OrganizationContext) { return this.service.assignOperationalRole(dto, c); }
  @Patch('operational-roles/:id/end') endRole(@Param('id') id: string, @CurrentOrganization() c: OrganizationContext) { return this.service.endOperationalRole(id, c); }
  @Post('operational-roles/:id/transfer') transferRole(@Param('id') id: string, @Body() dto: TransferKidsOperationalRoleDto, @CurrentOrganization() c: OrganizationContext) { return this.service.transferOperationalRole(id, dto, c); }
  @Post('children') createChild(@Body() dto: CreateKidsChildDto, @CurrentOrganization() c: OrganizationContext) { return this.service.createChild(dto, c); }
  @Get('children/:id/care-profile') careProfile(@Param('id') id: string, @CurrentOrganization() c: OrganizationContext) { return this.service.careProfile(id, c); }
  @Get('children/:id/attendance') childAttendance(@Param('id') id: string, @CurrentOrganization() c: OrganizationContext) { return this.service.childAttendance(id, c); }
  @Post('children/:id/care-profile') upsertCareProfile(@Param('id') id: string, @Body() dto: UpsertKidsCareProfileDto, @CurrentOrganization() c: OrganizationContext) { return this.service.upsertCareProfile(id, dto, c); }
  @Post('classes') createClass(@Body() dto: CreateKidsClassDto, @CurrentOrganization() c: OrganizationContext) { return this.service.createClass(dto, c); }
  @Get('classes') classes(@CurrentOrganization() c: OrganizationContext) { return this.service.classes(c); }
  @Get('classes/:id/attendance') classAttendance(@Param('id') id: string, @CurrentOrganization() c: OrganizationContext) { return this.service.classAttendance(id, c); }
  @Post('classes/:id/enrollments') enroll(@Param('id') id: string, @Body() dto: EnrollKidDto, @CurrentOrganization() c: OrganizationContext) { return this.service.enroll(id, dto, c); }
  @Post('children/:id/authorized-pickups') authorizePickup(@Param('id') id: string, @Body() dto: AuthorizeKidsPickupDto, @CurrentOrganization() c: OrganizationContext) { return this.service.authorizePickup(id, dto, c); }
  @Post('check-ins') checkIn(@Body() dto: KidsCheckInDto, @CurrentOrganization() c: OrganizationContext) { return this.service.checkIn(dto, c); }
  @Post('pre-check-ins') preCheckIn(@Body() dto: CreateKidsPreCheckInDto, @CurrentOrganization() c: OrganizationContext) { return this.service.preCheckIn(dto, c); }
  @Get('worship-events/:id/pre-check-ins') pendingPreCheckIns(@Param('id') id: string, @CurrentOrganization() c: OrganizationContext) { return this.service.pendingPreCheckIns(id, c); }
  @Post('pre-check-ins/:id/confirm') confirmPreCheckIn(@Param('id') id: string, @CurrentOrganization() c: OrganizationContext) { return this.service.confirmPreCheckIn(id, c); }
  @Patch('pre-check-ins/:id/cancel') cancelPreCheckIn(@Param('id') id: string, @CurrentOrganization() c: OrganizationContext) { return this.service.cancelPreCheckIn(id, c); }
  @Post('worship-events/:id/pre-check-ins/expire') expirePreCheckIns(@Param('id') id: string, @CurrentOrganization() c: OrganizationContext) { return this.service.expirePreCheckIns(id, c); }
  @Post('check-ins/scan') scanCheckIn(@Body() dto: ScanKidsQrDto, @CurrentOrganization() c: OrganizationContext) { return this.service.scanCheckIn(dto, c); }
  @Post('check-ins/:id/check-out') checkOut(@Param('id') id: string, @Body() dto: KidsCheckInDto, @CurrentOrganization() c: OrganizationContext) { return this.service.checkOut(id, dto, c); }
  @Post('check-outs/scan') scanCheckOut(@Body() dto: ScanKidsQrDto, @CurrentOrganization() c: OrganizationContext) { return this.service.scanCheckOut(dto, c); }
  @Get('check-ins/open') open(@CurrentOrganization() c: OrganizationContext) { return this.service.openCheckIns(c); }
  @Get('worship-events/:id/overview') worshipOverview(@Param('id') id: string, @CurrentOrganization() c: OrganizationContext) { return this.service.worshipOverview(id, c); }
}
