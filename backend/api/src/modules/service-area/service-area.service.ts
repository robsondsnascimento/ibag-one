import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ServiceMembershipRole } from '../../generated/prisma/client';
import { OrganizationContext } from '../../common/context/organization-context';
import { PrismaService } from '../../database/prisma.service';
import { AddServiceMemberDto } from './dto/add-service-member.dto';
import { CreateServiceAreaDto } from './dto/create-service-area.dto';
import { CreateServiceScheduleDto } from './dto/create-service-schedule.dto';
import { CreateServiceTeamDto } from './dto/create-service-team.dto';
import { UpdateServiceScheduleStatusDto } from './dto/update-service-schedule-status.dto';

@Injectable()
export class ServiceAreaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateServiceAreaDto, context: OrganizationContext) {
    await this.assertCentralManagement(context);
    if (dto.scope === 'GLOBAL' && dto.campusId) throw new BadRequestException('Uma área global não deve ser vinculada a um campus');
    if (dto.scope === 'CAMPUS' && !dto.campusId) throw new BadRequestException('Uma área local precisa informar o campus');
    if (dto.campusId) await this.campus(dto.campusId, context);
    return this.prisma.serviceArea.create({ data: { ...dto, organizationId: context.organizationId } });
  }

  async findAll(context: OrganizationContext) {
    return this.prisma.serviceArea.findMany({
      where: { organizationId: context.organizationId, ativo: true },
      include: { campus: true, _count: { select: { teams: { where: { ativo: true } }, memberships: { where: { ativo: true } } } } },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string, context: OrganizationContext) {
    const area = await this.area(id, context);
    return this.prisma.serviceArea.findUnique({
      where: { id: area.id },
      include: {
        campus: true,
        teams: { where: { ativo: true }, include: { campus: true }, orderBy: { nome: 'asc' } },
        memberships: { where: { ativo: true }, include: { person: true, team: true, campus: true }, orderBy: { inicio: 'desc' } },
      },
    });
  }

  async createTeam(areaId: string, dto: CreateServiceTeamDto, context: OrganizationContext) {
    const area = await this.area(areaId, context);
    await this.assertAreaManagement(area.id, context);
    const campus = await this.campus(dto.campusId, context);
    if (area.scope === 'CAMPUS' && area.campusId !== campus.id) throw new BadRequestException('A equipe deve pertencer ao campus da área local');
    return this.prisma.serviceTeam.create({ data: { ...dto, serviceAreaId: area.id, organizationId: context.organizationId }, include: { campus: true, serviceArea: true } });
  }

  async addMember(areaId: string, dto: AddServiceMemberDto, context: OrganizationContext) {
    const area = await this.area(areaId, context);
    const placement = await this.resolvePlacement(area, dto, context);
    await this.assertAreaManagement(area.id, context, placement.teamId, placement.campusId, dto.role);
    const person = await this.prisma.person.findFirst({ where: { id: dto.personId, organizationId: context.organizationId, ativo: true } });
    if (!person) throw new NotFoundException('Pessoa ativa não encontrada na organização atual');
    const exists = await this.prisma.serviceMembership.findFirst({ where: { personId: dto.personId, serviceAreaId: area.id, role: dto.role, teamId: placement.teamId, campusId: placement.campusId, ativo: true } });
    if (exists) throw new BadRequestException('A pessoa já possui este vínculo ativo na área de serviço');
    return this.prisma.serviceMembership.create({ data: { personId: dto.personId, serviceAreaId: area.id, role: dto.role, ...placement, inicio: new Date(), ativo: true }, include: { person: true, serviceArea: true, team: true, campus: true } });
  }

  async endMembership(id: string, context: OrganizationContext) {
    const membership = await this.prisma.serviceMembership.findFirst({ where: { id, ativo: true, serviceArea: { organizationId: context.organizationId } } });
    if (!membership) throw new NotFoundException('Vínculo ativo não encontrado na organização atual');
    await this.assertAreaManagement(membership.serviceAreaId, context, membership.teamId ?? undefined, membership.campusId ?? undefined, membership.role);
    return this.prisma.serviceMembership.update({ where: { id }, data: { ativo: false, fim: new Date() } });
  }

  async createSchedule(teamId: string, dto: CreateServiceScheduleDto, context: OrganizationContext) {
    const team = await this.team(teamId, context);
    await this.assertAreaManagement(team.serviceAreaId, context, team.id, team.campusId);
    const member = await this.prisma.serviceMembership.findFirst({ where: { personId: dto.personId, teamId: team.id, ativo: true } });
    if (!member) throw new BadRequestException('A pessoa precisa possuir vínculo ativo com esta equipe');
    const data = new Date(dto.data);
    const exists = await this.prisma.serviceSchedule.findFirst({ where: { teamId: team.id, personId: dto.personId, data } });
    if (exists) throw new BadRequestException('A pessoa já possui uma escala nesta equipe para esta data');
    return this.prisma.serviceSchedule.create({ data: { ...dto, data, teamId: team.id, organizationId: context.organizationId }, include: { person: true, team: true } });
  }

  async findSchedules(teamId: string, start: string | undefined, end: string | undefined, context: OrganizationContext) {
    const team = await this.team(teamId, context);
    await this.assertCanViewTeam(team, context);
    const data = start || end ? { ...(start ? { gte: new Date(start) } : {}), ...(end ? { lte: new Date(end) } : {}) } : undefined;
    return this.prisma.serviceSchedule.findMany({ where: { teamId: team.id, ...(data ? { data } : {}) }, include: { person: true }, orderBy: { data: 'asc' } });
  }

  async updateScheduleStatus(id: string, dto: UpdateServiceScheduleStatusDto, context: OrganizationContext) {
    const schedule = await this.prisma.serviceSchedule.findFirst({ where: { id, organizationId: context.organizationId }, include: { team: true } });
    if (!schedule) throw new NotFoundException('Escala não encontrada na organização atual');
    if (schedule.personId !== context.personId) await this.assertAreaManagement(schedule.team.serviceAreaId, context, schedule.teamId, schedule.team.campusId);
    return this.prisma.serviceSchedule.update({ where: { id }, data: dto, include: { person: true, team: true } });
  }

  private async resolvePlacement(area: { id: string; scope: string; campusId: string | null }, dto: AddServiceMemberDto, context: OrganizationContext) {
    if (dto.role === ServiceMembershipRole.GENERAL_LEADER) {
      if (dto.teamId || dto.campusId) throw new BadRequestException('A liderança geral não deve ser vinculada a equipe ou campus');
      return { teamId: undefined, campusId: undefined };
    }
    if (dto.role === ServiceMembershipRole.CAMPUS_LEADER) {
      if (!dto.campusId || dto.teamId) throw new BadRequestException('A liderança de campus precisa informar somente o campus');
      const campus = await this.campus(dto.campusId, context);
      if (area.scope === 'CAMPUS' && area.campusId !== campus.id) throw new BadRequestException('A liderança deve pertencer ao campus da área local');
      return { teamId: undefined, campusId: campus.id };
    }
    if (!dto.teamId) throw new BadRequestException('Integrantes e líderes de equipe precisam informar uma equipe');
    const team = await this.team(dto.teamId, context);
    if (team.serviceAreaId !== area.id) throw new BadRequestException('A equipe não pertence à área de serviço informada');
    if (dto.campusId && dto.campusId !== team.campusId) throw new BadRequestException('O campus informado não corresponde à equipe');
    return { teamId: team.id, campusId: team.campusId };
  }

  private async area(id: string, context: OrganizationContext) {
    const area = await this.prisma.serviceArea.findFirst({ where: { id, organizationId: context.organizationId, ativo: true } });
    if (!area) throw new NotFoundException('Área de serviço ativa não encontrada na organização atual');
    return area;
  }

  private async team(id: string, context: OrganizationContext) {
    const team = await this.prisma.serviceTeam.findFirst({ where: { id, organizationId: context.organizationId, ativo: true } });
    if (!team) throw new NotFoundException('Equipe ativa não encontrada na organização atual');
    return team;
  }

  private async campus(id: string, context: OrganizationContext) {
    const campus = await this.prisma.campus.findFirst({ where: { id, organizationId: context.organizationId, ativo: true } });
    if (!campus) throw new NotFoundException('Campus ativo não encontrado na organização atual');
    return campus;
  }

  private async assertCentralManagement(context: OrganizationContext) {
    const user = await this.prisma.user.findFirst({ where: { id: context.userId, organizationId: context.organizationId } });
    if (!user || !['SECRETARY', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) throw new ForbiddenException('Somente secretaria ou administração pode criar áreas de serviço');
  }

  private async assertAreaManagement(areaId: string, context: OrganizationContext, teamId?: string, campusId?: string, targetRole?: ServiceMembershipRole) {
    const user = await this.prisma.user.findFirst({ where: { id: context.userId, organizationId: context.organizationId } });
    if (user && ['SECRETARY', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) return;
    const general = await this.prisma.serviceMembership.findFirst({ where: { personId: context.personId, serviceAreaId: areaId, role: ServiceMembershipRole.GENERAL_LEADER, ativo: true } });
    if (general) return;
    if (campusId) {
      const campusLeader = await this.prisma.serviceMembership.findFirst({ where: { personId: context.personId, serviceAreaId: areaId, campusId, role: ServiceMembershipRole.CAMPUS_LEADER, ativo: true } });
      if (campusLeader) return;
    }
    if (teamId && targetRole !== ServiceMembershipRole.GENERAL_LEADER && targetRole !== ServiceMembershipRole.CAMPUS_LEADER) {
      const teamLeader = await this.prisma.serviceMembership.findFirst({ where: { personId: context.personId, teamId, role: ServiceMembershipRole.TEAM_LEADER, ativo: true } });
      if (teamLeader && (!targetRole || targetRole === ServiceMembershipRole.MEMBER)) return;
    }
    throw new ForbiddenException('Sem permissão para gerenciar esta área de serviço');
  }

  private async assertCanViewTeam(team: { id: string; serviceAreaId: string; campusId: string }, context: OrganizationContext) {
    try { await this.assertAreaManagement(team.serviceAreaId, context, team.id, team.campusId); return; } catch (error) { if (!(error instanceof ForbiddenException)) throw error; }
    const membership = await this.prisma.serviceMembership.findFirst({ where: { personId: context.personId, teamId: team.id, ativo: true } });
    if (!membership) throw new ForbiddenException('Sem acesso à escala desta equipe');
  }
}
