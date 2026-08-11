import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventStatus, EventType } from '../../generated/prisma/client';
import { hasAnyUserRole, hasPastoralCampusAccess } from '../../common/access/user-role.util';
import { OrganizationContext } from '../../common/context/organization-context';
import { PrismaService } from '../../database/prisma.service';
import { GoogleCalendarSyncService } from '../google-calendar/google-calendar-sync.service';
import { CreateEventChecklistDto } from './dto/create-event-checklist.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

type AgendaActor = { autoApprove: boolean; canBlockAgenda: boolean };

@Injectable()
export class EventService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleCalendar?: GoogleCalendarSyncService,
  ) {}

  async create(dto: CreateEventDto, context: OrganizationContext) {
    const actor = await this.canCreate(dto, context);
    const inicio = new Date(dto.inicio);
    const fim = new Date(dto.fim);
    if (inicio >= fim) throw new BadRequestException('O horário de término deve ser posterior ao início');
    if (dto.blocksCampusAgenda && !actor.canBlockAgenda) throw new ForbiddenException('Somente secretaria ou administração pode bloquear a agenda do campus');
    await this.validateReferences(dto, context);
    await this.assertNoConflict(dto, inicio, fim, context);
    const status = actor.autoApprove ? EventStatus.APPROVED : EventStatus.REQUESTED;
    const event = await this.prisma.event.create({
      data: {
        titulo: dto.titulo,
        descricao: dto.descricao,
        type: dto.type,
        campusId: dto.campusId,
        cellId: dto.cellId,
        inicio,
        fim,
        responsiblePersonId: dto.responsiblePersonId,
        alertEnabled: dto.alertEnabled ?? false,
        blocksCampusAgenda: dto.blocksCampusAgenda ?? false,
        status,
        organizationId: context.organizationId,
        createdByUserId: context.userId,
        spaces: dto.spaceIds?.length ? { create: dto.spaceIds.map(spaceId => ({ spaceId })) } : undefined,
        serviceAreas: dto.serviceAreaIds?.length ? { create: dto.serviceAreaIds.map(serviceAreaId => ({ serviceAreaId })) } : undefined,
        teams: dto.teamIds?.length ? { create: dto.teamIds.map(teamId => ({ teamId })) } : undefined,
        history: { create: { status, changedByUserId: context.userId } },
      },
      include: this.details,
    });
    await this.syncGoogleCalendar(event.id);
    return event;
  }

  async findAll(campusId: string | undefined, start: string | undefined, end: string | undefined, context: OrganizationContext) {
    await this.assertAgendaAccess(context);
    const inicio = start || end ? { ...(start ? { gte: new Date(start) } : {}), ...(end ? { lte: new Date(end) } : {}) } : undefined;
    return this.prisma.event.findMany({
      where: {
        organizationId: context.organizationId,
        ...(campusId ? { campusId } : {}),
        ...(inicio ? { inicio } : {}),
        status: { not: EventStatus.CANCELLED },
      },
      include: this.details,
      orderBy: { inicio: 'asc' },
    });
  }

  async findVisibleToMe(start: string | undefined, end: string | undefined, context: OrganizationContext) {
    const user = await this.user(context);
    const campusIds = Array.from(new Set([
      user.person?.campusId,
      ...(user.person?.campusMemberships?.map(membership => membership.campusId) ?? []),
    ].filter((campusId): campusId is string => Boolean(campusId))));

    if (!campusIds.length) return [];

    const inicio = start || end
      ? {
        ...(start ? { gte: new Date(start) } : {}),
        ...(end ? { lte: new Date(end) } : {}),
      }
      : undefined;

    return this.prisma.event.findMany({
      where: {
        organizationId: context.organizationId,
        campusId: { in: campusIds },
        status: EventStatus.APPROVED,
        ...(inicio ? { inicio } : {}),
      },
      include: this.mobileDetails,
      orderBy: { inicio: 'asc' },
    });
  }

  async findOne(id: string, context: OrganizationContext) {
    await this.assertAgendaAccess(context);
    return this.event(id, context, true);
  }

  async update(id: string, dto: UpdateEventDto, context: OrganizationContext) {
    const current = await this.event(id, context);
    await this.assertOperationalAccess(current, context);
    const user = await this.user(context);
    const next = {
      campusId: dto.campusId ?? current.campusId,
      cellId: dto.cellId ?? current.cellId,
      responsiblePersonId: dto.responsiblePersonId ?? current.responsiblePersonId,
      spaceIds: dto.spaceIds ?? current.spaces.map(item => item.spaceId),
      serviceAreaIds: dto.serviceAreaIds ?? current.serviceAreas.map(item => item.serviceAreaId),
      teamIds: dto.teamIds ?? current.teams.map(item => item.teamId),
      blocksCampusAgenda: dto.blocksCampusAgenda ?? current.blocksCampusAgenda,
    };
    const inicio = dto.inicio ? new Date(dto.inicio) : current.inicio;
    const fim = dto.fim ? new Date(dto.fim) : current.fim;
    if (inicio >= fim) throw new BadRequestException('O horário de término deve ser posterior ao início');
    if (next.blocksCampusAgenda && !this.central(user)) throw new ForbiddenException('Somente secretaria ou administração pode bloquear a agenda do campus');
    await this.assertRequestScope(next, context);
    await this.validateReferences(next, context);
    await this.assertNoConflict(next, inicio, fim, context, current.id);
    const event = await this.prisma.event.update({
      where: { id: current.id },
      data: {
        ...(dto.titulo !== undefined ? { titulo: dto.titulo } : {}),
        ...(dto.descricao !== undefined ? { descricao: dto.descricao } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.campusId !== undefined ? { campusId: dto.campusId } : {}),
        ...(dto.cellId !== undefined ? { cellId: dto.cellId } : {}),
        ...(dto.inicio !== undefined ? { inicio } : {}),
        ...(dto.fim !== undefined ? { fim } : {}),
        ...(dto.responsiblePersonId !== undefined ? { responsiblePersonId: dto.responsiblePersonId } : {}),
        ...(dto.alertEnabled !== undefined ? { alertEnabled: dto.alertEnabled } : {}),
        ...(dto.blocksCampusAgenda !== undefined ? { blocksCampusAgenda: dto.blocksCampusAgenda } : {}),
        ...(dto.spaceIds !== undefined ? { spaces: { deleteMany: {}, create: dto.spaceIds.map(spaceId => ({ spaceId })) } } : {}),
        ...(dto.serviceAreaIds !== undefined ? { serviceAreas: { deleteMany: {}, create: dto.serviceAreaIds.map(serviceAreaId => ({ serviceAreaId })) } } : {}),
        ...(dto.teamIds !== undefined ? { teams: { deleteMany: {}, create: dto.teamIds.map(teamId => ({ teamId })) } } : {}),
      },
      include: this.details,
    });
    await this.syncGoogleCalendar(event.id);
    return event;
  }

  async approve(id: string, context: OrganizationContext) {
    const event = await this.event(id, context);
    if (event.status !== EventStatus.REQUESTED) throw new BadRequestException('Somente eventos solicitados podem ser aprovados');
    await this.authorizeApproval(event.type, event.campusId, context);
    await this.assertNoConflict({ campusId: event.campusId, spaceIds: event.spaces.map(item => item.spaceId), blocksCampusAgenda: event.blocksCampusAgenda }, event.inicio, event.fim, context, event.id);
    const approved = await this.prisma.$transaction(async transaction => {
      await transaction.eventHistory.create({ data: { eventId: event.id, status: EventStatus.APPROVED, changedByUserId: context.userId } });
      return transaction.event.update({ where: { id: event.id }, data: { status: EventStatus.APPROVED }, include: this.details });
    });
    await this.syncGoogleCalendar(approved.id);
    return approved;
  }

  async cancel(id: string, context: OrganizationContext) {
    const event = await this.event(id, context);
    await this.assertOperationalAccess(event, context);
    const cancelled = await this.prisma.$transaction(async transaction => {
      await transaction.eventHistory.create({ data: { eventId: event.id, status: EventStatus.CANCELLED, changedByUserId: context.userId } });
      return transaction.event.update({ where: { id: event.id }, data: { status: EventStatus.CANCELLED }, include: this.details });
    });
    await this.syncGoogleCalendar(cancelled.id);
    return cancelled;
  }

  async syncWithGoogleCalendar(id: string, context: OrganizationContext) {
    const event = await this.event(id, context);
    await this.assertOperationalAccess(event, context);
    return this.googleCalendar?.sync(event.id) ?? { status: 'DISABLED' as const };
  }

  async googleCalendarStatus(context: OrganizationContext) {
    await this.assertAgendaAccess(context);
    return { configured: this.googleCalendar?.isConfigured() ?? false };
  }

  async addChecklist(eventId: string, dto: CreateEventChecklistDto, context: OrganizationContext) {
    const event = await this.event(eventId, context);
    await this.assertOperationalAccess(event, context);
    return this.prisma.eventChecklist.create({ data: { eventId: event.id, ...dto } });
  }

  async toggleChecklist(id: string, context: OrganizationContext) {
    const item = await this.prisma.eventChecklist.findFirst({ where: { id, event: { organizationId: context.organizationId } }, include: { event: { include: this.details } } });
    if (!item) throw new NotFoundException('Item de checklist não encontrado');
    await this.assertOperationalAccess(item.event, context);
    return this.prisma.eventChecklist.update({ where: { id }, data: { concluido: !item.concluido, concluidoEm: item.concluido ? null : new Date() } });
  }

  private async canCreate(dto: CreateEventDto, context: OrganizationContext): Promise<AgendaActor> {
    const user = await this.user(context);
    const administration = this.central(user);
    if (administration || hasPastoralCampusAccess(user, dto.campusId)) {
      return { autoApprove: true, canBlockAgenda: administration };
    }

    if (dto.cellId) {
      const cellLeader = await this.isActiveCellLeader(context.personId, dto.cellId, context.organizationId);
      if (!cellLeader) throw new ForbiddenException('Somente a liderança da própria célula pode vincular um evento à célula');
      if (!dto.teamIds?.length && !dto.serviceAreaIds?.length) return { autoApprove: false, canBlockAgenda: false };
    }

    const targets = [
      ...(dto.teamIds?.length ? [{ teamId: { in: dto.teamIds } }] : []),
      ...(dto.serviceAreaIds?.length ? [{ serviceAreaId: { in: dto.serviceAreaIds } }] : []),
    ];
    if (!targets.length) throw new ForbiddenException('O líder de área precisa vincular sua área ou equipe ao evento');
    const leader = await this.prisma.serviceMembership.findFirst({
      where: {
        personId: context.personId,
        ativo: true,
        role: { in: ['GENERAL_LEADER', 'CAMPUS_LEADER', 'TEAM_LEADER'] },
        OR: targets,
        serviceArea: { organizationId: context.organizationId },
      },
    });
    if (!leader) throw new ForbiddenException('Somente lideranças da área ou da célula envolvida podem solicitar eventos');
    return { autoApprove: false, canBlockAgenda: false };
  }

  private async assertRequestScope(dto: { campusId: string; cellId?: string | null; serviceAreaIds?: string[]; teamIds?: string[] }, context: OrganizationContext) {
    const user = await this.user(context);
    if (this.central(user) || hasPastoralCampusAccess(user, dto.campusId)) return;
    if (dto.cellId) {
      const cellLeader = await this.isActiveCellLeader(context.personId, dto.cellId, context.organizationId);
      if (!cellLeader) throw new ForbiddenException('Somente a liderança da própria célula pode vincular um evento à célula');
      if (!dto.teamIds?.length && !dto.serviceAreaIds?.length) return;
    }

    const targets = [
      ...(dto.teamIds?.length ? [{ teamId: { in: dto.teamIds } }] : []),
      ...(dto.serviceAreaIds?.length ? [{ serviceAreaId: { in: dto.serviceAreaIds } }] : []),
    ];
    if (!targets.length) throw new ForbiddenException('O líder de área precisa vincular sua área ou equipe ao evento');
    const leader = await this.prisma.serviceMembership.findFirst({
      where: {
        personId: context.personId,
        ativo: true,
        role: { in: ['GENERAL_LEADER', 'CAMPUS_LEADER', 'TEAM_LEADER'] },
        OR: targets,
        serviceArea: { organizationId: context.organizationId },
      },
    });
    if (!leader) throw new ForbiddenException('A liderança só pode vincular áreas, equipes ou células sob sua responsabilidade');
  }

  private async validateReferences(dto: { campusId: string; cellId?: string | null; responsiblePersonId?: string | null; spaceIds?: string[]; serviceAreaIds?: string[]; teamIds?: string[] }, context: OrganizationContext) {
    const campus = await this.prisma.campus.findFirst({ where: { id: dto.campusId, organizationId: context.organizationId, ativo: true } });
    if (!campus) throw new NotFoundException('Campus ativo não encontrado');
    if (dto.cellId) {
      const cell = await this.prisma.cell.findFirst({ where: { id: dto.cellId, campusId: dto.campusId, organizationId: context.organizationId, ativo: true } });
      if (!cell) throw new BadRequestException('A célula deve estar ativa e pertencer ao campus do evento');
    }
    if (dto.responsiblePersonId && !await this.prisma.person.findFirst({ where: { id: dto.responsiblePersonId, organizationId: context.organizationId, ativo: true } })) throw new NotFoundException('Responsável não encontrado');
    if (dto.spaceIds?.length) {
      const count = await this.prisma.space.count({ where: { id: { in: dto.spaceIds }, campusId: dto.campusId, organizationId: context.organizationId, ativo: true } });
      if (count !== dto.spaceIds.length) throw new BadRequestException('Um ou mais espaços não pertencem ao campus do evento');
    }
    if (dto.serviceAreaIds?.length) {
      const count = await this.prisma.serviceArea.count({ where: { id: { in: dto.serviceAreaIds }, organizationId: context.organizationId, ativo: true, OR: [{ scope: 'GLOBAL' }, { campusId: dto.campusId }] } });
      if (count !== dto.serviceAreaIds.length) throw new BadRequestException('Uma ou mais áreas não estão disponíveis neste campus');
    }
    if (dto.teamIds?.length) {
      const count = await this.prisma.serviceTeam.count({ where: { id: { in: dto.teamIds }, campusId: dto.campusId, organizationId: context.organizationId, ativo: true } });
      if (count !== dto.teamIds.length) throw new BadRequestException('Uma ou mais equipes não pertencem ao campus do evento');
    }
  }

  private async assertNoConflict(dto: { campusId: string; spaceIds?: string[]; blocksCampusAgenda?: boolean }, inicio: Date, fim: Date, context: OrganizationContext, exceptId?: string) {
    const active = { not: EventStatus.CANCELLED };
    const overlap = { inicio: { lt: fim }, fim: { gt: inicio } };
    const base = { organizationId: context.organizationId, campusId: dto.campusId, ...overlap, status: active, ...(exceptId ? { id: { not: exceptId } } : {}) };
    const sameCampus = await this.prisma.event.findFirst({ where: base });
    if (dto.blocksCampusAgenda && sameCampus) throw new BadRequestException('Há outro evento no campus neste período');
    const campusBlock = await this.prisma.event.findFirst({ where: { ...base, blocksCampusAgenda: true } });
    if (!dto.blocksCampusAgenda && campusBlock) throw new BadRequestException('A agenda do campus está bloqueada por outro evento neste período');
    if (dto.spaceIds?.length) {
      const conflict = await this.prisma.eventSpace.findFirst({ where: { spaceId: { in: dto.spaceIds }, event: { organizationId: context.organizationId, ...overlap, status: active, ...(exceptId ? { id: { not: exceptId } } : {}) } } });
      if (conflict) throw new BadRequestException('Um dos espaços informados já está reservado neste período');
    }
  }

  private async event(id: string, context: OrganizationContext, full = false): Promise<any> {
    const event = await this.prisma.event.findFirst({
      where: { id, organizationId: context.organizationId },
      include: full ? { ...this.details, history: { include: { changedByUser: { select: { id: true, loginEmail: true } } }, orderBy: { createdAt: 'desc' } } } : this.details,
    });
    if (!event) throw new NotFoundException('Evento não encontrado na organização atual');
    return event;
  }

  private async assertAgendaAccess(context: OrganizationContext) {
    const user = await this.user(context);
    if (this.central(user) || hasAnyUserRole(user, ['PASTOR'])) return;
    const [areaLeadership, cellLeadership] = await Promise.all([
      this.prisma.serviceMembership.findFirst({ where: { personId: context.personId, ativo: true, role: { in: ['GENERAL_LEADER', 'CAMPUS_LEADER', 'TEAM_LEADER'] }, serviceArea: { organizationId: context.organizationId } } }),
      this.prisma.cellLeadership.findFirst({ where: { personId: context.personId, ativo: true, cell: { organizationId: context.organizationId, ativo: true } } }),
    ]);
    if (!areaLeadership && !cellLeadership) throw new ForbiddenException('Somente lideranças de área ou célula podem acessar a agenda');
  }

  private async assertOperationalAccess(event: any, context: OrganizationContext) {
    const user = await this.user(context);
    if (event.createdByUserId === context.userId || this.central(user) || hasPastoralCampusAccess(user, event.campusId)) return;
    const [areaLeadership, cellLeadership] = await Promise.all([
      event.serviceAreas.length || event.teams.length
        ? this.prisma.serviceMembership.findFirst({ where: { personId: context.personId, ativo: true, role: { in: ['GENERAL_LEADER', 'CAMPUS_LEADER', 'TEAM_LEADER'] }, OR: [{ serviceAreaId: { in: event.serviceAreas.map(item => item.serviceAreaId) } }, { teamId: { in: event.teams.map(item => item.teamId) } }], serviceArea: { organizationId: context.organizationId } } })
        : null,
      event.cellId ? this.isActiveCellLeader(context.personId, event.cellId, context.organizationId) : false,
    ]);
    if (!areaLeadership && !cellLeadership) throw new ForbiddenException('Sem permissão para operar este evento');
  }

  private async authorizeApproval(type: EventType, campusId: string, context: OrganizationContext) {
    const user = await this.user(context);
    const pastoral = ([EventType.PASTORAL, EventType.CONFERENCE, EventType.SPECIAL_PROGRAM] as EventType[]).includes(type);
    if ((pastoral && (hasAnyUserRole(user, ['ADMIN', 'SUPER_ADMIN']) || hasPastoralCampusAccess(user, campusId))) || (!pastoral && (hasAnyUserRole(user, ['SECRETARY', 'ADMIN', 'SUPER_ADMIN']) || hasPastoralCampusAccess(user, campusId)))) return;
    throw new ForbiddenException('Sem permissão para aprovar este tipo de evento');
  }

  private async isActiveCellLeader(personId: string, cellId: string, organizationId: string) {
    return Boolean(await this.prisma.cellLeadership.findFirst({ where: { personId, cellId, ativo: true, cell: { organizationId, ativo: true } } }));
  }

  private async user(context: OrganizationContext) {
    const user = await this.prisma.user.findFirst({ where: { id: context.userId, organizationId: context.organizationId }, include: { person: { select: { campusId: true, campusMemberships: { where: { ativo: true }, select: { campusId: true } } } }, additionalRoles: { select: { role: true } } } });
    if (!user) throw new ForbiddenException('Usuário sem vínculo organizacional');
    return user;
  }

  private central(user: { role: any; additionalRoles?: { role: any }[] }) {
    return hasAnyUserRole(user, ['SECRETARY', 'ADMIN', 'SUPER_ADMIN']);
  }

  private async syncGoogleCalendar(eventId: string) {
    if (this.googleCalendar) await this.googleCalendar.sync(eventId);
  }

  private readonly details = {
    campus: true,
    cell: { select: { id: true, nome: true } },
    responsiblePerson: true,
    createdByUser: { select: { id: true, loginEmail: true } },
    spaces: { include: { space: true } },
    serviceAreas: { include: { serviceArea: true } },
    teams: { include: { team: true } },
    checklist: true,
    googleCalendarSync: true,
  } as const;

  private readonly mobileDetails = {
    campus: {
      select: {
        id: true,
        nome: true,
      },
    },
    serviceAreas: {
      include: {
        serviceArea: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    },
  } as const;
}
