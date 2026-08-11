import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationAudience, ServiceMembershipRole, ServiceScheduleHistoryAction, ServiceScheduleStatus, ServiceScheduleSwapRequestStatus } from '../../generated/prisma/client';
import { OrganizationContext } from '../../common/context/organization-context';
import { PrismaService } from '../../database/prisma.service';
import { AddServiceMemberDto } from './dto/add-service-member.dto';
import { AssignServiceOperationalRoleDto } from './dto/assign-service-operational-role.dto';
import { CreateServiceAreaDto } from './dto/create-service-area.dto';
import { CreateServiceScheduleBatchDto } from './dto/create-service-schedule-batch.dto';
import { CreateServiceScheduleDto } from './dto/create-service-schedule.dto';
import { CreateServiceTeamDto } from './dto/create-service-team.dto';
import { CreateServiceScheduleSwapRequestDto } from './dto/create-service-schedule-swap-request.dto';
import { RejectServiceScheduleSwapRequestDto } from './dto/reject-service-schedule-swap-request.dto';
import { SubstituteServiceScheduleDto } from './dto/substitute-service-schedule.dto';
import { UpdateServiceMemberFunctionsDto } from './dto/update-service-member-functions.dto';
import { UpdateServiceScheduleStatusDto } from './dto/update-service-schedule-status.dto';
import { userRoleWhere } from '../../common/access/user-role.util';

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
    return this.prisma.serviceMembership.create({ data: { personId: dto.personId, serviceAreaId: area.id, role: dto.role, funcoes: this.normalizeFunctions(dto.funcoes), ...placement, inicio: new Date(), ativo: true }, include: { person: true, serviceArea: true, team: true, campus: true } });
  }

  async endMembership(id: string, context: OrganizationContext) {
    const membership = await this.prisma.serviceMembership.findFirst({ where: { id, ativo: true, serviceArea: { organizationId: context.organizationId } } });
    if (!membership) throw new NotFoundException('Vínculo ativo não encontrado na organização atual');
    await this.assertAreaManagement(membership.serviceAreaId, context, membership.teamId ?? undefined, membership.campusId ?? undefined, membership.role);
    return this.prisma.serviceMembership.update({ where: { id }, data: { ativo: false, fim: new Date() } });
  }

  async updateMembershipFunctions(id: string, dto: UpdateServiceMemberFunctionsDto, context: OrganizationContext) {
    const membership = await this.prisma.serviceMembership.findFirst({ where: { id, ativo: true, serviceArea: { organizationId: context.organizationId } } });
    if (!membership) throw new NotFoundException('Vínculo ativo não encontrado na organização atual');
    if (!membership.teamId) throw new BadRequestException('Funções de serviço só podem ser definidas para integrantes de uma equipe');
    await this.assertAreaManagement(membership.serviceAreaId, context, membership.teamId, membership.campusId ?? undefined, membership.role);
    return this.prisma.serviceMembership.update({
      where: { id },
      data: { funcoes: this.normalizeFunctions(dto.funcoes) },
      include: { person: true, serviceArea: true, team: true, campus: true },
    });
  }

  async assignOperationalRole(teamId: string, dto: AssignServiceOperationalRoleDto, context: OrganizationContext) {
    const team = await this.team(teamId, context);
    await this.assertAreaManagement(team.serviceAreaId, context, team.id, team.campusId);
    const membership = await this.prisma.serviceMembership.findFirst({ where: { personId: dto.personId, teamId: team.id, serviceAreaId: team.serviceAreaId, ativo: true } });
    if (!membership) throw new BadRequestException('A pessoa precisa ser integrante ativo desta equipe para receber uma função operacional');
    const existing = await this.prisma.serviceOperationalRoleAssignment.findFirst({ where: { personId: dto.personId, teamId: team.id, role: dto.role, ativo: true } });
    if (existing) throw new BadRequestException('A pessoa já possui esta função operacional ativa na equipe');
    return this.prisma.serviceOperationalRoleAssignment.create({
      data: {
        personId: dto.personId,
        teamId: team.id,
        serviceAreaId: team.serviceAreaId,
        organizationId: context.organizationId,
        role: dto.role,
      },
      include: { person: true, team: true, serviceArea: true },
    });
  }

  async findOperationalRoles(teamId: string, context: OrganizationContext) {
    const team = await this.team(teamId, context);
    await this.assertCanViewTeam(team, context);
    return this.prisma.serviceOperationalRoleAssignment.findMany({
      where: { teamId: team.id, ativo: true },
      include: { person: true, serviceArea: true },
      orderBy: [{ role: 'asc' }, { inicio: 'asc' }],
    });
  }

  async endOperationalRole(id: string, context: OrganizationContext) {
    const assignment = await this.prisma.serviceOperationalRoleAssignment.findFirst({
      where: { id, organizationId: context.organizationId, ativo: true },
      include: { team: true },
    });
    if (!assignment) throw new NotFoundException('Função operacional ativa não encontrada na organização atual');
    await this.assertAreaManagement(assignment.serviceAreaId, context, assignment.teamId, assignment.team.campusId);
    return this.prisma.serviceOperationalRoleAssignment.update({ where: { id }, data: { ativo: false, fim: new Date() } });
  }

  async createSchedule(teamId: string, dto: CreateServiceScheduleDto, context: OrganizationContext) {
    const team = await this.team(teamId, context);
    await this.assertAreaManagement(team.serviceAreaId, context, team.id, team.campusId);
    const candidate = await this.validateScheduleInput(team, dto, context);
    const schedule = await this.prisma.serviceSchedule.create({
      data: {
        ...dto,
        data: candidate.data,
        teamId: team.id,
        organizationId: context.organizationId,
        history: { create: { action: ServiceScheduleHistoryAction.CREATED, newStatus: ServiceScheduleStatus.SCHEDULED, replacementPersonId: dto.personId, changedByUserId: context.userId } },
      },
      include: this.scheduleDetails,
    });
    await this.notifyScheduleAssignment(schedule, context);
    return schedule;
  }

  async createScheduleBatch(teamId: string, dto: CreateServiceScheduleBatchDto, context: OrganizationContext) {
    const team = await this.team(teamId, context);
    await this.assertAreaManagement(team.serviceAreaId, context, team.id, team.campusId);
    const candidates = [] as Array<{ dto: CreateServiceScheduleDto; data: Date; event: { id: string; inicio: Date; fim: Date } | null }>;
    for (const item of dto.schedules) {
      const candidate = await this.validateScheduleInput(team, item, context);
      candidates.push({ dto: item, ...candidate });
    }
    this.assertNoBatchConflicts(candidates);
    const schedules = await this.prisma.$transaction(transaction => Promise.all(candidates.map(candidate => transaction.serviceSchedule.create({
      data: {
        ...candidate.dto,
        data: candidate.data,
        teamId: team.id,
        organizationId: context.organizationId,
        history: { create: { action: ServiceScheduleHistoryAction.CREATED, newStatus: ServiceScheduleStatus.SCHEDULED, replacementPersonId: candidate.dto.personId, changedByUserId: context.userId } },
      },
      include: this.scheduleDetails,
    }))));
    await Promise.all(schedules.map(schedule => this.notifyScheduleAssignment(schedule, context)));
    return schedules;
  }

  async findSchedules(teamId: string, start: string | undefined, end: string | undefined, context: OrganizationContext) {
    const team = await this.team(teamId, context);
    await this.assertCanViewTeam(team, context);
    const data = this.period(start, end);
    return this.prisma.serviceSchedule.findMany({ where: { teamId: team.id, ...(data ? { data } : {}) }, include: this.scheduleDetails, orderBy: { data: 'asc' } });
  }

  async findAreaSchedules(areaId: string, start: string | undefined, end: string | undefined, teamId: string | undefined, status: ServiceScheduleStatus | undefined, context: OrganizationContext) {
    const area = await this.area(areaId, context);
    if (teamId) {
      const team = await this.team(teamId, context);
      if (team.serviceAreaId !== area.id) throw new BadRequestException('A equipe não pertence à área de serviço informada');
    }
    const teamScope = await this.scheduleTeamScope(area.id, context);
    const data = this.period(start, end);
    return this.prisma.serviceSchedule.findMany({
      where: {
        organizationId: context.organizationId,
        ...(data ? { data } : {}),
        ...(status ? { status } : {}),
        team: { serviceAreaId: area.id, ...(teamId ? { id: teamId } : {}), ...(teamScope ?? {}) },
      },
      include: this.scheduleDetails,
      orderBy: [{ data: 'asc' }, { team: { nome: 'asc' } }],
    });
  }

  async findMySchedules(start: string | undefined, end: string | undefined, context: OrganizationContext) {
    const data = this.period(start, end);
    return this.prisma.serviceSchedule.findMany({
      where: { organizationId: context.organizationId, personId: context.personId, ...(data ? { data } : {}) },
      include: this.scheduleDetails,
      orderBy: { data: 'asc' },
    });
  }

  async findScheduleSwapCandidates(id: string, context: OrganizationContext) {
    const schedule = await this.prisma.serviceSchedule.findFirst({ where: { id, organizationId: context.organizationId }, include: this.scheduleDetails });
    if (!schedule) throw new NotFoundException('Escala não encontrada na organização atual');
    if (schedule.personId !== context.personId) throw new ForbiddenException('Somente a pessoa escalada pode consultar candidatos para a troca');
    this.assertSwapRequestable(schedule);
    const memberships = await this.prisma.serviceMembership.findMany({
      where: { teamId: schedule.teamId, ativo: true, personId: { not: schedule.personId }, person: { ativo: true } },
      include: { person: { select: { id: true, nome: true, telefone: true, email: true } } },
      orderBy: { person: { nome: 'asc' } },
    });
    const candidates = new Map<string, { id: string; nome: string; telefone: string | null; email: string | null }>();
    for (const membership of memberships) {
      if (!this.memberSupportsFunction(membership.funcoes, schedule.funcao)) continue;
      try {
        await this.assertNoTeamScheduleDuplicate(schedule.teamId, membership.personId, schedule.data, context, schedule.id);
        await this.assertNoScheduleConflict(membership.personId, schedule.data, schedule.event, context, schedule.id);
        candidates.set(membership.personId, membership.person);
      } catch (error) {
        if (!(error instanceof BadRequestException)) throw error;
      }
    }
    return [...candidates.values()];
  }

  async createScheduleSwapRequest(id: string, dto: CreateServiceScheduleSwapRequestDto, context: OrganizationContext) {
    const schedule = await this.prisma.serviceSchedule.findFirst({ where: { id, organizationId: context.organizationId }, include: this.scheduleDetails });
    if (!schedule) throw new NotFoundException('Escala não encontrada na organização atual');
    if (schedule.personId !== context.personId) throw new ForbiddenException('Somente a pessoa escalada pode solicitar uma troca');
    this.assertSwapRequestable(schedule);
    if (dto.replacementPersonId === schedule.personId) throw new BadRequestException('A pessoa indicada para a troca deve ser diferente da pessoa escalada');
    const replacementMembership = await this.assertActiveTeamMember(dto.replacementPersonId, schedule.teamId);
    this.assertMemberCanServeFunction(replacementMembership.funcoes, schedule.funcao);
    await this.assertNoTeamScheduleDuplicate(schedule.teamId, dto.replacementPersonId, schedule.data, context, schedule.id);
    await this.assertNoScheduleConflict(dto.replacementPersonId, schedule.data, schedule.event, context, schedule.id);
    const pending = await this.prisma.serviceScheduleSwapRequest.findFirst({ where: { scheduleId: schedule.id, status: ServiceScheduleSwapRequestStatus.PENDING } });
    if (pending) throw new BadRequestException('Já existe uma solicitação de troca pendente para esta escala');
    const request = await this.prisma.serviceScheduleSwapRequest.create({
      data: {
        organizationId: context.organizationId,
        teamId: schedule.teamId,
        scheduleId: schedule.id,
        requesterPersonId: schedule.personId,
        replacementPersonId: dto.replacementPersonId,
        reason: dto.reason,
      },
      include: this.swapRequestDetails,
    });
    await this.notifySwapRequest(request, context);
    return request;
  }

  async findTeamScheduleSwapRequests(teamId: string, context: OrganizationContext) {
    const team = await this.team(teamId, context);
    await this.assertAreaManagement(team.serviceAreaId, context, team.id, team.campusId);
    return this.prisma.serviceScheduleSwapRequest.findMany({
      where: { organizationId: context.organizationId, teamId: team.id, status: ServiceScheduleSwapRequestStatus.PENDING },
      include: this.swapRequestDetails,
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveScheduleSwapRequest(id: string, context: OrganizationContext) {
    const request = await this.prisma.serviceScheduleSwapRequest.findFirst({ where: { id, organizationId: context.organizationId }, include: this.swapRequestDetails });
    if (!request) throw new NotFoundException('Solicitação de troca não encontrada na organização atual');
    if (request.status !== ServiceScheduleSwapRequestStatus.PENDING) throw new BadRequestException('Esta solicitação de troca já foi decidida');
    await this.assertAreaManagement(request.schedule.team.serviceAreaId, context, request.teamId, request.schedule.team.campusId);
    if (request.schedule.personId !== request.requesterPersonId) throw new BadRequestException('A escala já foi alterada e esta solicitação não pode mais ser aprovada');
    this.assertSwapRequestable(request.schedule);
    const replacementMembership = await this.assertActiveTeamMember(request.replacementPersonId, request.teamId);
    this.assertMemberCanServeFunction(replacementMembership.funcoes, request.schedule.funcao);
    await this.assertNoTeamScheduleDuplicate(request.teamId, request.replacementPersonId, request.schedule.data, context, request.schedule.id);
    await this.assertNoScheduleConflict(request.replacementPersonId, request.schedule.data, request.schedule.event, context, request.schedule.id);
    const [updatedSchedule, resolvedRequest] = await this.prisma.$transaction([
      this.prisma.serviceSchedule.update({
        where: { id: request.scheduleId },
        data: {
          personId: request.replacementPersonId,
          status: ServiceScheduleStatus.SCHEDULED,
          history: {
            create: {
              action: ServiceScheduleHistoryAction.SUBSTITUTED,
              previousStatus: request.schedule.status,
              newStatus: ServiceScheduleStatus.SCHEDULED,
              previousPersonId: request.requesterPersonId,
              replacementPersonId: request.replacementPersonId,
              previousPersonName: request.schedule.person.nome,
              replacementPersonName: replacementMembership.person.nome,
              reason: request.reason,
              changedByUserId: context.userId,
            },
          },
        },
        include: this.scheduleDetails,
      }),
      this.prisma.serviceScheduleSwapRequest.update({
        where: { id: request.id },
        data: { status: ServiceScheduleSwapRequestStatus.APPROVED, decidedAt: new Date(), decidedByUserId: context.userId },
        include: this.swapRequestDetails,
      }),
    ]);
    await this.notifyScheduleSubstitution(updatedSchedule, request.schedule.person, context);
    return resolvedRequest;
  }

  async rejectScheduleSwapRequest(id: string, dto: RejectServiceScheduleSwapRequestDto, context: OrganizationContext) {
    const request = await this.prisma.serviceScheduleSwapRequest.findFirst({ where: { id, organizationId: context.organizationId }, include: this.swapRequestDetails });
    if (!request) throw new NotFoundException('Solicitação de troca não encontrada na organização atual');
    if (request.status !== ServiceScheduleSwapRequestStatus.PENDING) throw new BadRequestException('Esta solicitação de troca já foi decidida');
    await this.assertAreaManagement(request.schedule.team.serviceAreaId, context, request.teamId, request.schedule.team.campusId);
    const resolved = await this.prisma.serviceScheduleSwapRequest.update({
      where: { id: request.id },
      data: { status: ServiceScheduleSwapRequestStatus.REJECTED, decisionReason: dto.reason, decidedAt: new Date(), decidedByUserId: context.userId },
      include: this.swapRequestDetails,
    });
    await this.notifyPeople(request.schedule, [request.requesterPersonId], 'Solicitação de troca recusada', `A liderança não aprovou sua solicitação de troca para a escala de ${request.schedule.funcao} ${this.scheduleReference(request.schedule)}.${dto.reason ? ` Motivo: ${dto.reason}` : ''}`, context);
    return resolved;
  }

  async findScheduleHistory(id: string, context: OrganizationContext) {
    const schedule = await this.prisma.serviceSchedule.findFirst({ where: { id, organizationId: context.organizationId }, include: { team: true } });
    if (!schedule) throw new NotFoundException('Escala não encontrada na organização atual');
    if (schedule.personId !== context.personId) await this.assertAreaManagement(schedule.team.serviceAreaId, context, schedule.teamId, schedule.team.campusId);
    return this.prisma.serviceScheduleHistory.findMany({
      where: { scheduleId: schedule.id },
      include: { changedByUser: { select: { id: true, loginEmail: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findEventSchedules(eventId: string, context: OrganizationContext) {
    const event = await this.prisma.event.findFirst({ where: { id: eventId, organizationId: context.organizationId }, include: { teams: { select: { teamId: true } } } });
    if (!event) throw new NotFoundException('Evento não encontrado na organização atual');
    const central = await this.prisma.user.findFirst({ where: { id: context.userId, organizationId: context.organizationId, ...userRoleWhere(['SECRETARY', 'ADMIN', 'SUPER_ADMIN']) } });
    if (!central) {
      const membership = await this.prisma.serviceMembership.findFirst({ where: { personId: context.personId, teamId: { in: event.teams.map(item => item.teamId) }, ativo: true } });
      if (!membership) throw new ForbiddenException('Sem acesso às escalas deste evento');
    }
    return this.prisma.serviceSchedule.findMany({ where: { eventId: event.id }, include: this.scheduleDetails, orderBy: [{ data: 'asc' }, { team: { nome: 'asc' } }] });
  }

  async updateScheduleStatus(id: string, dto: UpdateServiceScheduleStatusDto, context: OrganizationContext) {
    const schedule = await this.prisma.serviceSchedule.findFirst({ where: { id, organizationId: context.organizationId }, include: this.scheduleDetails });
    if (!schedule) throw new NotFoundException('Escala não encontrada na organização atual');
    const ownSchedule = schedule.personId === context.personId;
    if (dto.reason && dto.status !== ServiceScheduleStatus.DECLINED) throw new BadRequestException('O motivo pode ser informado somente ao recusar uma escala');
    if (ownSchedule) {
      if (schedule.status === ServiceScheduleStatus.COMPLETED) throw new BadRequestException('Uma escala concluída não pode receber nova resposta');
      if (dto.status !== ServiceScheduleStatus.CONFIRMED && dto.status !== ServiceScheduleStatus.DECLINED) throw new ForbiddenException('A pessoa escalada pode apenas confirmar ou recusar sua escala');
    } else {
      await this.assertAreaManagement(schedule.team.serviceAreaId, context, schedule.teamId, schedule.team.campusId);
    }
    const updated = await this.prisma.serviceSchedule.update({
      where: { id },
      data: {
        status: dto.status,
        history: {
          create: {
            action: ServiceScheduleHistoryAction.STATUS_CHANGED,
            previousStatus: schedule.status,
            newStatus: dto.status,
            reason: dto.reason,
            changedByUserId: context.userId,
          },
        },
      },
      include: this.scheduleDetails,
    });
    if (ownSchedule && dto.status === ServiceScheduleStatus.DECLINED && schedule.status !== ServiceScheduleStatus.DECLINED) await this.notifyScheduleDecline(updated, context);
    return updated;
  }

  async substituteSchedule(id: string, dto: SubstituteServiceScheduleDto, context: OrganizationContext) {
    const schedule = await this.prisma.serviceSchedule.findFirst({ where: { id, organizationId: context.organizationId }, include: this.scheduleDetails });
    if (!schedule) throw new NotFoundException('Escala não encontrada na organização atual');
    await this.assertAreaManagement(schedule.team.serviceAreaId, context, schedule.teamId, schedule.team.campusId);
    if (schedule.status === ServiceScheduleStatus.COMPLETED) throw new BadRequestException('Uma escala concluída não pode ser substituída');
    if (schedule.personId === dto.personId) throw new BadRequestException('A pessoa substituta deve ser diferente da pessoa atualmente escalada');
    const replacementMembership = await this.assertActiveTeamMember(dto.personId, schedule.teamId);
    await this.assertNoTeamScheduleDuplicate(schedule.teamId, dto.personId, schedule.data, context, schedule.id);
    await this.assertNoScheduleConflict(dto.personId, schedule.data, schedule.event, context, schedule.id);
    const previousPerson = schedule.person;
    const updated = await this.prisma.serviceSchedule.update({
      where: { id },
      data: {
        personId: dto.personId,
        status: ServiceScheduleStatus.SCHEDULED,
        history: {
          create: {
            action: ServiceScheduleHistoryAction.SUBSTITUTED,
            previousStatus: schedule.status,
            newStatus: ServiceScheduleStatus.SCHEDULED,
            previousPersonId: schedule.personId,
            replacementPersonId: dto.personId,
            previousPersonName: schedule.person.nome,
            replacementPersonName: replacementMembership.person.nome,
            reason: dto.reason,
            changedByUserId: context.userId,
          },
        },
      },
      include: this.scheduleDetails,
    });
    await this.notifyScheduleSubstitution(updated, previousPerson, context);
    return updated;
  }

  private async validateScheduleInput(team: { id: string; serviceAreaId: string; campusId: string }, dto: CreateServiceScheduleDto, context: OrganizationContext) {
    await this.assertActiveTeamMember(dto.personId, team.id);
    const data = new Date(dto.data);
    if (Number.isNaN(data.getTime())) throw new BadRequestException('A data da escala é inválida');
    const event = dto.eventId ? await this.eventForTeam(dto.eventId, team.id, context) : null;
    await this.assertNoTeamScheduleDuplicate(team.id, dto.personId, data, context);
    await this.assertNoScheduleConflict(dto.personId, data, event, context);
    return { data, event };
  }

  private async assertActiveTeamMember(personId: string, teamId: string) {
    const member = await this.prisma.serviceMembership.findFirst({ where: { personId, teamId, ativo: true }, include: { person: { select: { nome: true } } } });
    if (!member) throw new BadRequestException('A pessoa precisa possuir vínculo ativo com esta equipe');
    return member;
  }

  private assertSwapRequestable(schedule: { status: ServiceScheduleStatus; data: Date }) {
    if (schedule.status === ServiceScheduleStatus.COMPLETED || schedule.status === ServiceScheduleStatus.DECLINED) throw new BadRequestException('Esta escala não pode receber uma solicitação de troca');
    if (schedule.data <= new Date()) throw new BadRequestException('A solicitação de troca deve ser feita antes do horário da escala');
  }

  private assertMemberCanServeFunction(functions: string[], scheduleFunction: string) {
    if (!this.memberSupportsFunction(functions, scheduleFunction)) throw new BadRequestException(`A pessoa indicada não possui a função ${scheduleFunction} cadastrada nesta equipe`);
  }

  private memberSupportsFunction(functions: string[], scheduleFunction: string) {
    const normalizedScheduleFunction = this.normalizeFunction(scheduleFunction);
    return functions.some(value => this.normalizeFunction(value) === normalizedScheduleFunction);
  }

  private normalizeFunctions(functions: string[] | undefined) {
    return [...new Map((functions ?? []).map(value => value.trim()).filter(Boolean).map(value => [this.normalizeFunction(value), value])).values()];
  }

  private normalizeFunction(value: string) {
    return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
  }

  private async eventForTeam(eventId: string, teamId: string, context: OrganizationContext) {
    const event = await this.prisma.event.findFirst({ where: { id: eventId, organizationId: context.organizationId, status: 'APPROVED', teams: { some: { teamId } } }, select: { id: true, inicio: true, fim: true } });
    if (!event) throw new BadRequestException('O evento precisa estar aprovado e envolver esta equipe');
    return event;
  }

  private async assertNoTeamScheduleDuplicate(teamId: string, personId: string, data: Date, context: OrganizationContext, exceptId?: string) {
    const exists = await this.prisma.serviceSchedule.findFirst({ where: { teamId, personId, data, organizationId: context.organizationId, ...(exceptId ? { id: { not: exceptId } } : {}) } });
    if (exists) throw new BadRequestException('A pessoa já possui uma escala nesta equipe para esta data');
  }

  private async assertNoScheduleConflict(personId: string, data: Date, event: { id: string; inicio: Date; fim: Date } | null, context: OrganizationContext, exceptId?: string) {
    const activeSchedule = { in: [ServiceScheduleStatus.SCHEDULED, ServiceScheduleStatus.CONFIRMED] };
    const base = { organizationId: context.organizationId, personId, status: activeSchedule, ...(exceptId ? { id: { not: exceptId } } : {}) };
    const simultaneous = await this.prisma.serviceSchedule.findFirst({ where: { ...base, data } });
    if (simultaneous) throw new BadRequestException('A pessoa possui outra escala ativa neste mesmo horário');
    if (!event) return;
    const overlap = await this.prisma.serviceSchedule.findFirst({
      where: {
        ...base,
        event: { is: { status: { not: 'CANCELLED' }, inicio: { lt: event.fim }, fim: { gt: event.inicio } } },
      },
    });
    if (overlap) throw new BadRequestException('A pessoa possui outra escala ativa em um evento que conflita com este horário');
  }

  private assertNoBatchConflicts(candidates: Array<{ dto: CreateServiceScheduleDto; data: Date; event: { id: string; inicio: Date; fim: Date } | null }>) {
    for (let index = 0; index < candidates.length; index += 1) {
      for (let prior = 0; prior < index; prior += 1) {
        const current = candidates[index];
        const previous = candidates[prior];
        if (current.dto.personId !== previous.dto.personId) continue;
        const sameMoment = current.data.getTime() === previous.data.getTime();
        const eventOverlap = current.event && previous.event && current.event.inicio < previous.event.fim && current.event.fim > previous.event.inicio;
        if (sameMoment || eventOverlap) throw new BadRequestException('O lote contém escalas conflitantes para a mesma pessoa');
      }
    }
  }

  private period(start: string | undefined, end: string | undefined) {
    return start || end ? { ...(start ? { gte: new Date(start) } : {}), ...(end ? { lte: new Date(end) } : {}) } : undefined;
  }

  private async scheduleTeamScope(areaId: string, context: OrganizationContext) {
    const central = await this.prisma.user.findFirst({ where: { id: context.userId, organizationId: context.organizationId, ...userRoleWhere(['SECRETARY', 'ADMIN', 'SUPER_ADMIN']) } });
    if (central) return undefined;
    const leaderships = await this.prisma.serviceMembership.findMany({
      where: {
        personId: context.personId,
        serviceAreaId: areaId,
        ativo: true,
        role: { in: [ServiceMembershipRole.GENERAL_LEADER, ServiceMembershipRole.CAMPUS_LEADER, ServiceMembershipRole.TEAM_LEADER] },
      },
      select: { role: true, campusId: true, teamId: true },
    });
    if (!leaderships.length) throw new ForbiddenException('Sem acesso à visão de escalas desta área de serviço');
    if (leaderships.some(link => link.role === ServiceMembershipRole.GENERAL_LEADER)) return undefined;
    const campusIds = leaderships.filter(link => link.role === ServiceMembershipRole.CAMPUS_LEADER && link.campusId).map(link => link.campusId as string);
    const teamIds = leaderships.filter(link => link.role === ServiceMembershipRole.TEAM_LEADER && link.teamId).map(link => link.teamId as string);
    return { OR: [...(campusIds.length ? [{ campusId: { in: campusIds } }] : []), ...(teamIds.length ? [{ id: { in: teamIds } }] : [])] };
  }

  private async notifyScheduleAssignment(schedule: any, context: OrganizationContext) {
    await this.notifyPeople(schedule, [schedule.personId], 'Nova escala de serviço', `Você foi escalado(a) como ${schedule.funcao} ${this.scheduleReference(schedule)}.`, context);
  }

  private async notifyScheduleDecline(schedule: any, context: OrganizationContext) {
    const leaders = await this.scheduleLeaders(schedule);
    await this.notifyPeople(schedule, leaders.map(leader => leader.personId).filter(personId => personId !== schedule.personId), 'Escala recusada', `${schedule.person.nome} recusou a escala de ${schedule.funcao} ${this.scheduleReference(schedule)}.`, context);
  }

  private async notifySwapRequest(request: any, context: OrganizationContext) {
    const leaders = await this.scheduleLeaders(request.schedule);
    await this.notifyPeople(request.schedule, leaders.map(leader => leader.personId).filter(personId => personId !== request.requesterPersonId), 'Solicitação de troca de escala', `${request.requesterPerson.nome} indicou ${request.replacementPerson.nome} para a escala de ${request.schedule.funcao} ${this.scheduleReference(request.schedule)}.`, context);
  }

  private scheduleLeaders(schedule: any) {
    return this.prisma.serviceMembership.findMany({
      where: {
        serviceAreaId: schedule.team.serviceAreaId,
        ativo: true,
        OR: [
          { role: ServiceMembershipRole.GENERAL_LEADER },
          { role: ServiceMembershipRole.CAMPUS_LEADER, campusId: schedule.team.campusId },
          { role: ServiceMembershipRole.TEAM_LEADER, teamId: schedule.teamId },
        ],
      },
      select: { personId: true },
    });
  }

  private async notifyScheduleSubstitution(schedule: any, previousPerson: { id: string; nome: string }, context: OrganizationContext) {
    await this.notifyPeople(schedule, [previousPerson.id], 'Escala transferida', `Sua escala de ${schedule.funcao} ${this.scheduleReference(schedule)} foi transferida para outra pessoa.`, context);
    await this.notifyScheduleAssignment(schedule, context);
  }

  private async notifyPeople(schedule: any, personIds: string[], title: string, message: string, context: OrganizationContext) {
    const recipients = [...new Set(personIds)];
    if (!recipients.length) return;
    await this.prisma.notification.create({
      data: {
        titulo: title,
        mensagem: message,
        audience: NotificationAudience.PERSON,
        organizationId: context.organizationId,
        serviceAreaId: schedule.team.serviceAreaId,
        serviceTeamId: schedule.teamId,
        ...(schedule.eventId ? { eventId: schedule.eventId } : {}),
        recipients: { create: recipients.map(personId => ({ personId })) },
      },
    });
  }

  private scheduleReference(schedule: any) {
    return schedule.event ? `no evento ${schedule.event.titulo}` : `em ${this.formatDate(schedule.data)}`;
  }

  private formatDate(value: Date) {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(value);
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
    const user = await this.prisma.user.findFirst({ where: { id: context.userId, organizationId: context.organizationId, ...userRoleWhere(['SECRETARY', 'ADMIN', 'SUPER_ADMIN']) } });
    if (!user) throw new ForbiddenException('Somente secretaria ou administração pode criar áreas de serviço');
  }

  private async assertAreaManagement(areaId: string, context: OrganizationContext, teamId?: string, campusId?: string, targetRole?: ServiceMembershipRole) {
    const user = await this.prisma.user.findFirst({ where: { id: context.userId, organizationId: context.organizationId, ...userRoleWhere(['SECRETARY', 'ADMIN', 'SUPER_ADMIN']) } });
    if (user) return;
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
    try {
      await this.assertAreaManagement(team.serviceAreaId, context, team.id, team.campusId);
      return;
    } catch (error) {
      if (!(error instanceof ForbiddenException)) throw error;
    }
    const membership = await this.prisma.serviceMembership.findFirst({ where: { personId: context.personId, teamId: team.id, ativo: true } });
    if (!membership) throw new ForbiddenException('Sem acesso à escala desta equipe');
  }

  private readonly scheduleDetails = {
    person: true,
    team: { include: { serviceArea: true, campus: true } },
    event: true,
  } as const;

  private readonly swapRequestDetails = {
    requesterPerson: true,
    replacementPerson: true,
    decidedByUser: { select: { id: true, loginEmail: true } },
    schedule: {
      include: {
        person: true,
        team: { include: { serviceArea: true, campus: true } },
        event: true,
      },
    },
  } as const;
}
