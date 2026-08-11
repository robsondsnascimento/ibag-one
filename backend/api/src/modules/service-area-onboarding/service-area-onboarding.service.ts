import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ServiceAreaApplicationStatus, ServiceMembershipRole } from '../../generated/prisma/client';
import { userRoleWhere } from '../../common/access/user-role.util';
import { OrganizationContext } from '../../common/context/organization-context';
import { PrismaService } from '../../database/prisma.service';
import { ApproveServiceAreaApplicationDto } from './dto/approve-service-area-application.dto';
import { CompleteServiceAreaApplicationStageDto } from './dto/complete-service-area-application-stage.dto';
import { CreateServiceAreaApplicationDto } from './dto/create-service-area-application.dto';
import { CreateServiceAreaEntryStageDto } from './dto/create-service-area-entry-stage.dto';
import { RejectServiceAreaApplicationDto } from './dto/reject-service-area-application.dto';
import { ReorderServiceAreaEntryStagesDto } from './dto/reorder-service-area-entry-stages.dto';
import { UpdateServiceAreaEntryStageDto } from './dto/update-service-area-entry-stage.dto';
import { WithdrawServiceAreaApplicationDto } from './dto/withdraw-service-area-application.dto';

@Injectable()
export class ServiceAreaOnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async findStages(areaId: string, context: OrganizationContext) {
    const area = await this.area(areaId, context);
    return this.prisma.serviceAreaEntryStage.findMany({ where: { serviceAreaId: area.id, ativo: true }, orderBy: { ordem: 'asc' } });
  }

  async createStage(areaId: string, dto: CreateServiceAreaEntryStageDto, context: OrganizationContext) {
    const area = await this.area(areaId, context);
    await this.assertStageManagement(area, context);
    const last = await this.prisma.serviceAreaEntryStage.aggregate({ where: { serviceAreaId: area.id }, _max: { ordem: true } });
    return this.prisma.serviceAreaEntryStage.create({
      data: { ...dto, ordem: (last._max.ordem ?? 0) + 1, organizationId: context.organizationId, serviceAreaId: area.id },
    });
  }

  async updateStage(id: string, dto: UpdateServiceAreaEntryStageDto, context: OrganizationContext) {
    const stage = await this.prisma.serviceAreaEntryStage.findFirst({ where: { id, organizationId: context.organizationId }, include: { serviceArea: true } });
    if (!stage) throw new NotFoundException('Etapa de entrada não encontrada na organização atual');
    await this.assertStageManagement(stage.serviceArea, context);
    return this.prisma.serviceAreaEntryStage.update({ where: { id: stage.id }, data: dto });
  }

  async reorderStages(areaId: string, dto: ReorderServiceAreaEntryStagesDto, context: OrganizationContext) {
    const area = await this.area(areaId, context);
    await this.assertStageManagement(area, context);
    const stages = await this.prisma.serviceAreaEntryStage.findMany({ where: { serviceAreaId: area.id, ativo: true }, orderBy: { ordem: 'asc' } });
    if (stages.length !== dto.stageIds.length || new Set(dto.stageIds).size !== dto.stageIds.length || stages.some(stage => !dto.stageIds.includes(stage.id))) throw new BadRequestException('A nova ordem deve conter exatamente as etapas desta área');
    const offset = Math.max(...stages.map(stage => stage.ordem), 0) + stages.length + 1;
    await this.prisma.$transaction(async transaction => {
      await Promise.all(stages.map(stage => transaction.serviceAreaEntryStage.update({ where: { id: stage.id }, data: { ordem: stage.ordem + offset } })));
      await Promise.all(dto.stageIds.map((stageId, index) => transaction.serviceAreaEntryStage.update({ where: { id: stageId }, data: { ordem: index + 1 } })));
    });
    return this.findStages(area.id, context);
  }

  async createApplication(dto: CreateServiceAreaApplicationDto, context: OrganizationContext) {
    const area = await this.area(dto.serviceAreaId, context);
    const personId = dto.personId ?? context.personId;
    await this.person(personId, context);
    const desiredTeam = dto.desiredTeamId ? await this.teamForArea(dto.desiredTeamId, area.id, context) : null;
    if (personId !== context.personId) await this.assertApplicationManagement(area, desiredTeam, context);
    const activeMembership = await this.prisma.serviceMembership.findFirst({ where: { personId, serviceAreaId: area.id, ativo: true } });
    if (activeMembership) throw new BadRequestException('A pessoa já possui vínculo ativo nesta área de serviço');
    const existing = await this.prisma.serviceAreaApplication.findFirst({ where: { personId, serviceAreaId: area.id, status: { in: [ServiceAreaApplicationStatus.INTERESTED, ServiceAreaApplicationStatus.IN_PROGRESS] } } });
    if (existing) throw new BadRequestException('A pessoa já possui um processo de entrada em aberto nesta área');
    return this.prisma.serviceAreaApplication.create({
      data: {
        organizationId: context.organizationId,
        serviceAreaId: area.id,
        personId,
        desiredTeamId: desiredTeam?.id,
        observacao: dto.observacao,
        createdByUserId: context.userId,
      },
      include: this.applicationDetails,
    });
  }

  async findMyApplications(context: OrganizationContext) {
    return this.prisma.serviceAreaApplication.findMany({
      where: { organizationId: context.organizationId, personId: context.personId },
      include: this.applicationDetails,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAreaApplications(areaId: string, status: ServiceAreaApplicationStatus | undefined, context: OrganizationContext) {
    const area = await this.area(areaId, context);
    await this.assertApplicationManagement(area, null, context);
    return this.prisma.serviceAreaApplication.findMany({
      where: { serviceAreaId: area.id, ...(status ? { status } : {}) },
      include: this.applicationDetails,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findApplication(id: string, context: OrganizationContext) {
    const application = await this.application(id, context);
    if (application.personId !== context.personId) await this.assertApplicationManagement(application.serviceArea, application.desiredTeam, context);
    return application;
  }

  async startApplication(id: string, context: OrganizationContext) {
    const application = await this.application(id, context);
    await this.assertApplicationManagement(application.serviceArea, application.desiredTeam, context);
    if (application.status !== ServiceAreaApplicationStatus.INTERESTED) throw new BadRequestException('Somente um interessado pode iniciar o processo de entrada');
    return this.prisma.serviceAreaApplication.update({
      where: { id: application.id },
      data: { status: ServiceAreaApplicationStatus.IN_PROGRESS, startedAt: new Date() },
      include: this.applicationDetails,
    });
  }

  async completeStage(applicationId: string, stageId: string, dto: CompleteServiceAreaApplicationStageDto, context: OrganizationContext) {
    const application = await this.application(applicationId, context);
    await this.assertApplicationManagement(application.serviceArea, application.desiredTeam, context);
    if (application.status !== ServiceAreaApplicationStatus.IN_PROGRESS) throw new BadRequestException('As etapas só podem ser concluídas em um processo em andamento');
    const stage = await this.prisma.serviceAreaEntryStage.findFirst({ where: { id: stageId, serviceAreaId: application.serviceAreaId, ativo: true } });
    if (!stage) throw new NotFoundException('Etapa ativa não encontrada para esta área de serviço');
    return this.prisma.serviceAreaApplicationStage.upsert({
      where: { applicationId_entryStageId: { applicationId: application.id, entryStageId: stage.id } },
      create: { applicationId: application.id, entryStageId: stage.id, observacao: dto.observacao, completedByUserId: context.userId },
      update: { observacao: dto.observacao, completedAt: new Date(), completedByUserId: context.userId },
      include: { entryStage: true, completedByUser: { select: { id: true, loginEmail: true } } },
    });
  }

  async approveApplication(id: string, dto: ApproveServiceAreaApplicationDto, context: OrganizationContext) {
    const application = await this.application(id, context);
    const team = await this.teamForArea(dto.teamId, application.serviceAreaId, context);
    await this.assertApplicationManagement(application.serviceArea, team, context);
    if (application.status !== ServiceAreaApplicationStatus.IN_PROGRESS) throw new BadRequestException('Somente um processo em andamento pode ser aprovado');
    const requiredStages = await this.prisma.serviceAreaEntryStage.findMany({ where: { serviceAreaId: application.serviceAreaId, ativo: true, obrigatoria: true }, select: { id: true } });
    const completedStageIds = new Set(application.stageCompletions.map(completion => completion.entryStageId));
    if (requiredStages.some(stage => !completedStageIds.has(stage.id))) throw new BadRequestException('Ainda existem etapas obrigatórias pendentes para esta pessoa');
    return this.prisma.$transaction(async transaction => {
      const activeMembership = await transaction.serviceMembership.findFirst({ where: { personId: application.personId, serviceAreaId: application.serviceAreaId, ativo: true } });
      if (activeMembership) throw new BadRequestException('A pessoa já possui vínculo ativo nesta área de serviço');
      await transaction.serviceMembership.create({
        data: {
          personId: application.personId,
          serviceAreaId: application.serviceAreaId,
          teamId: team.id,
          campusId: team.campusId,
          role: ServiceMembershipRole.MEMBER,
          inicio: new Date(),
          ativo: true,
        },
      });
      return transaction.serviceAreaApplication.update({
        where: { id: application.id },
        data: { status: ServiceAreaApplicationStatus.APPROVED, desiredTeamId: team.id, decidedAt: new Date(), decidedByUserId: context.userId },
        include: this.applicationDetails,
      });
    });
  }

  async rejectApplication(id: string, dto: RejectServiceAreaApplicationDto, context: OrganizationContext) {
    const application = await this.application(id, context);
    await this.assertApplicationManagement(application.serviceArea, application.desiredTeam, context);
    this.assertOpen(application.status);
    return this.prisma.serviceAreaApplication.update({
      where: { id: application.id },
      data: { status: ServiceAreaApplicationStatus.REJECTED, decisaoMotivo: dto.motivo, decidedAt: new Date(), decidedByUserId: context.userId },
      include: this.applicationDetails,
    });
  }

  async withdrawApplication(id: string, dto: WithdrawServiceAreaApplicationDto, context: OrganizationContext) {
    const application = await this.application(id, context);
    if (application.personId !== context.personId) await this.assertApplicationManagement(application.serviceArea, application.desiredTeam, context);
    this.assertOpen(application.status);
    return this.prisma.serviceAreaApplication.update({
      where: { id: application.id },
      data: { status: ServiceAreaApplicationStatus.WITHDRAWN, decisaoMotivo: dto.motivo, decidedAt: new Date(), decidedByUserId: context.userId },
      include: this.applicationDetails,
    });
  }

  private async area(id: string, context: OrganizationContext) {
    const area = await this.prisma.serviceArea.findFirst({ where: { id, organizationId: context.organizationId, ativo: true } });
    if (!area) throw new NotFoundException('Área de serviço ativa não encontrada na organização atual');
    return area;
  }

  private async person(id: string, context: OrganizationContext) {
    const person = await this.prisma.person.findFirst({ where: { id, organizationId: context.organizationId, ativo: true } });
    if (!person) throw new NotFoundException('Pessoa ativa não encontrada na organização atual');
    return person;
  }

  private async teamForArea(id: string, areaId: string, context: OrganizationContext) {
    const team = await this.prisma.serviceTeam.findFirst({ where: { id, serviceAreaId: areaId, organizationId: context.organizationId, ativo: true } });
    if (!team) throw new NotFoundException('Equipe ativa não encontrada nesta área de serviço');
    return team;
  }

  private async application(id: string, context: OrganizationContext) {
    const application = await this.prisma.serviceAreaApplication.findFirst({ where: { id, organizationId: context.organizationId }, include: this.applicationDetails });
    if (!application) throw new NotFoundException('Processo de entrada não encontrado na organização atual');
    return application;
  }

  private async assertStageManagement(area: { id: string }, context: OrganizationContext) {
    const central = await this.prisma.user.findFirst({ where: { id: context.userId, organizationId: context.organizationId, ...userRoleWhere(['SECRETARY', 'ADMIN', 'SUPER_ADMIN']) } });
    if (central) return;
    const generalLeader = await this.prisma.serviceMembership.findFirst({ where: { personId: context.personId, serviceAreaId: area.id, role: ServiceMembershipRole.GENERAL_LEADER, ativo: true } });
    if (generalLeader) return;
    throw new ForbiddenException('Somente a liderança geral da área pode configurar suas etapas de entrada');
  }

  private async assertApplicationManagement(area: { id: string; campusId?: string | null }, team: { id: string; campusId: string } | null, context: OrganizationContext) {
    const central = await this.prisma.user.findFirst({ where: { id: context.userId, organizationId: context.organizationId, ...userRoleWhere(['SECRETARY', 'ADMIN', 'SUPER_ADMIN']) } });
    if (central) return;
    const generalLeader = await this.prisma.serviceMembership.findFirst({ where: { personId: context.personId, serviceAreaId: area.id, role: ServiceMembershipRole.GENERAL_LEADER, ativo: true } });
    if (generalLeader) return;
    const campusId = team?.campusId ?? area.campusId;
    if (campusId) {
      const campusLeader = await this.prisma.serviceMembership.findFirst({ where: { personId: context.personId, serviceAreaId: area.id, campusId, role: ServiceMembershipRole.CAMPUS_LEADER, ativo: true } });
      if (campusLeader) return;
    }
    if (team) {
      const teamLeader = await this.prisma.serviceMembership.findFirst({ where: { personId: context.personId, teamId: team.id, role: ServiceMembershipRole.TEAM_LEADER, ativo: true } });
      if (teamLeader) return;
    }
    throw new ForbiddenException('Sem permissão para administrar este processo de entrada');
  }

  private assertOpen(status: ServiceAreaApplicationStatus) {
    if (status !== ServiceAreaApplicationStatus.INTERESTED && status !== ServiceAreaApplicationStatus.IN_PROGRESS) throw new BadRequestException('Este processo de entrada já foi encerrado');
  }

  private readonly applicationDetails = {
    person: true,
    serviceArea: true,
    desiredTeam: { include: { campus: true } },
    createdByUser: { select: { id: true, loginEmail: true } },
    decidedByUser: { select: { id: true, loginEmail: true } },
    stageCompletions: { include: { entryStage: true, completedByUser: { select: { id: true, loginEmail: true } } }, orderBy: { completedAt: 'asc' as const } },
  } as const;
}
