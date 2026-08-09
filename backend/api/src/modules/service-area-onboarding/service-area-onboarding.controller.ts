import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ServiceAreaApplicationStatus } from '../../generated/prisma/client';
import { OrganizationContext } from '../../common/context/organization-context';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApproveServiceAreaApplicationDto } from './dto/approve-service-area-application.dto';
import { CompleteServiceAreaApplicationStageDto } from './dto/complete-service-area-application-stage.dto';
import { CreateServiceAreaApplicationDto } from './dto/create-service-area-application.dto';
import { CreateServiceAreaEntryStageDto } from './dto/create-service-area-entry-stage.dto';
import { RejectServiceAreaApplicationDto } from './dto/reject-service-area-application.dto';
import { ReorderServiceAreaEntryStagesDto } from './dto/reorder-service-area-entry-stages.dto';
import { UpdateServiceAreaEntryStageDto } from './dto/update-service-area-entry-stage.dto';
import { WithdrawServiceAreaApplicationDto } from './dto/withdraw-service-area-application.dto';
import { ServiceAreaOnboardingService } from './service-area-onboarding.service';

@Controller('service-area-onboarding')
@UseGuards(JwtAuthGuard)
export class ServiceAreaOnboardingController {
  constructor(private readonly service: ServiceAreaOnboardingService) {}

  @Get('areas/:areaId/stages') findStages(@Param('areaId') areaId: string, @CurrentOrganization() context: OrganizationContext) { return this.service.findStages(areaId, context); }
  @Post('areas/:areaId/stages') createStage(@Param('areaId') areaId: string, @Body() dto: CreateServiceAreaEntryStageDto, @CurrentOrganization() context: OrganizationContext) { return this.service.createStage(areaId, dto, context); }
  @Patch('areas/:areaId/stages/reorder') reorderStages(@Param('areaId') areaId: string, @Body() dto: ReorderServiceAreaEntryStagesDto, @CurrentOrganization() context: OrganizationContext) { return this.service.reorderStages(areaId, dto, context); }
  @Patch('stages/:id') updateStage(@Param('id') id: string, @Body() dto: UpdateServiceAreaEntryStageDto, @CurrentOrganization() context: OrganizationContext) { return this.service.updateStage(id, dto, context); }

  @Post('applications') createApplication(@Body() dto: CreateServiceAreaApplicationDto, @CurrentOrganization() context: OrganizationContext) { return this.service.createApplication(dto, context); }
  @Get('applications/me') findMyApplications(@CurrentOrganization() context: OrganizationContext) { return this.service.findMyApplications(context); }
  @Get('areas/:areaId/applications') findAreaApplications(@Param('areaId') areaId: string, @Query('status') status: ServiceAreaApplicationStatus | undefined, @CurrentOrganization() context: OrganizationContext) { return this.service.findAreaApplications(areaId, status, context); }
  @Get('applications/:id') findApplication(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) { return this.service.findApplication(id, context); }
  @Patch('applications/:id/start') startApplication(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) { return this.service.startApplication(id, context); }
  @Post('applications/:id/stages/:stageId/complete') completeStage(@Param('id') id: string, @Param('stageId') stageId: string, @Body() dto: CompleteServiceAreaApplicationStageDto, @CurrentOrganization() context: OrganizationContext) { return this.service.completeStage(id, stageId, dto, context); }
  @Patch('applications/:id/approve') approveApplication(@Param('id') id: string, @Body() dto: ApproveServiceAreaApplicationDto, @CurrentOrganization() context: OrganizationContext) { return this.service.approveApplication(id, dto, context); }
  @Patch('applications/:id/reject') rejectApplication(@Param('id') id: string, @Body() dto: RejectServiceAreaApplicationDto, @CurrentOrganization() context: OrganizationContext) { return this.service.rejectApplication(id, dto, context); }
  @Patch('applications/:id/withdraw') withdrawApplication(@Param('id') id: string, @Body() dto: WithdrawServiceAreaApplicationDto, @CurrentOrganization() context: OrganizationContext) { return this.service.withdrawApplication(id, dto, context); }
}
