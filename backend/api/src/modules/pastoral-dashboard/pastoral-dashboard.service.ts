import { ForbiddenException, Injectable } from '@nestjs/common';
import { hasAnyUserRole, pastoralCampusIds } from '../../common/access/user-role.util';
import { OrganizationContext } from '../../common/context/organization-context';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PastoralDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(context: OrganizationContext) {
    const campusIds = await this.accessibleCampusIds(context);
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const day = start.getUTCDay();
    start.setUTCDate(start.getUTCDate() - (day === 0 ? 6 : day - 1));
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 7);
    const cellWhere = {
      organizationId: context.organizationId,
      ativo: true,
      ...this.campusFilter(campusIds),
    };
    const meetingWhere = { cell: cellWhere, data: { gte: start, lt: end } };
    const nextThirtyDays = new Date(now);
    nextThirtyDays.setDate(nextThirtyDays.getDate() + 30);
    const nextYear = new Date(now);
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const [cells, networks, leaders, meetings, pending, attendance, visitors, multiplications, serviceAreas, serviceTeams, volunteers, schedules, upcomingEvents, eventsNextYear, requestedEvents, spaces, kidsClasses, kidsEnrollments, kidsOpenCheckIns] = await Promise.all([
      this.prisma.cell.count({ where: cellWhere }),
      this.prisma.cellNetwork.count({ where: { organizationId: context.organizationId, ativo: true, ...this.campusFilter(campusIds) } }),
      this.prisma.cellLeadership.count({ where: { ativo: true, cell: cellWhere } }),
      this.prisma.cellMeeting.count({ where: meetingWhere }),
      this.prisma.cellMeeting.count({ where: { ...meetingWhere, registroConcluidoEm: null } }),
      this.prisma.cellMeetingAttendance.count({ where: { presente: true, meeting: meetingWhere } }),
      this.prisma.cellMeeting.aggregate({ where: meetingWhere, _sum: { visitantes: true } }),
      this.prisma.cellMultiplication.count({ where: { sourceCell: cellWhere } }),
      this.prisma.serviceArea.count({ where: { organizationId: context.organizationId, ativo: true, ...this.serviceAreaCampusFilter(campusIds) } }),
      this.prisma.serviceTeam.count({ where: { organizationId: context.organizationId, ativo: true, ...this.campusFilter(campusIds) } }),
      this.prisma.serviceMembership.count({ where: { ativo: true, serviceArea: { organizationId: context.organizationId }, ...this.membershipCampusFilter(campusIds) } }),
      this.prisma.serviceSchedule.count({ where: { organizationId: context.organizationId, data: { gte: now, lte: nextThirtyDays }, status: { in: ['SCHEDULED', 'CONFIRMED'] }, ...(campusIds ? { team: { campusId: { in: campusIds } } } : {}) } }),
      this.prisma.event.count({ where: { organizationId: context.organizationId, status: 'APPROVED', inicio: { gte: now, lte: nextThirtyDays }, ...this.campusFilter(campusIds) } }),
      this.prisma.event.count({ where: { organizationId: context.organizationId, status: 'APPROVED', inicio: { gte: now, lte: nextYear }, ...this.campusFilter(campusIds) } }),
      this.prisma.event.count({ where: { organizationId: context.organizationId, status: 'REQUESTED', ...this.campusFilter(campusIds) } }),
      this.prisma.space.count({ where: { organizationId: context.organizationId, ativo: true, ...this.campusFilter(campusIds) } }),
      this.prisma.kidsClass.count({ where: { organizationId: context.organizationId, ativo: true, ...this.campusFilter(campusIds) } }),
      this.prisma.kidsEnrollment.count({ where: { ativo: true, class: { organizationId: context.organizationId, ...this.campusFilter(campusIds) } } }),
      this.prisma.kidsCheckIn.count({ where: { status: 'CHECKED_IN', enrollment: { class: { organizationId: context.organizationId, ...this.campusFilter(campusIds) } } } }),
    ]);

    return {
      weekStart: start,
      cells,
      networks,
      activeLeaders: leaders,
      meetings,
      meetingsAwaitingCompletion: pending,
      attendance,
      visitors: visitors._sum.visitantes ?? 0,
      multiplications,
      serviceAreas,
      serviceTeams,
      activeVolunteerAssignments: volunteers,
      schedulesNext30Days: schedules,
      upcomingEventsNext30Days: upcomingEvents,
      upcomingEventsNextYear: eventsNextYear,
      eventsAwaitingApproval: requestedEvents,
      spaces,
      kidsClasses,
      kidsActiveEnrollments: kidsEnrollments,
      kidsOpenCheckIns,
    };
  }

  async geography(context: OrganizationContext) {
    const campusIds = await this.accessibleCampusIds(context);
    return this.prisma.cellLocation.findMany({
      where: { cell: { organizationId: context.organizationId, ativo: true, ...this.campusFilter(campusIds) } },
      select: {
        latitude: true,
        longitude: true,
        cell: { select: { id: true, nome: true, campus: { select: { nome: true } }, network: { select: { nome: true } } } },
      },
    });
  }

  async cells(context: OrganizationContext) {
    const campusIds = await this.accessibleCampusIds(context);
    const cells = await this.prisma.cell.findMany({
      where: { organizationId: context.organizationId, ...this.campusFilter(campusIds) },
      include: {
        campus: true,
        network: true,
        _count: { select: { sourceMultiplications: true } },
        sourceMultiplications: { select: { data: true }, orderBy: { data: 'desc' }, take: 1 },
      },
      orderBy: { nome: 'asc' },
    });
    return cells.map((cell) => ({
      id: cell.id,
      nome: cell.nome,
      status: cell.status,
      campus: cell.campus.nome,
      network: cell.network?.nome ?? null,
      multiplicationCount: cell._count.sourceMultiplications,
      lastMultiplicationAt: cell.sourceMultiplications[0]?.data ?? null,
    }));
  }

  async agenda(start: string | undefined, end: string | undefined, campusId: string | undefined, context: OrganizationContext) {
    const campusIds = await this.accessibleCampusIds(context);
    if (campusIds && campusId && !campusIds.includes(campusId)) {
      throw new ForbiddenException('Sem acesso à agenda deste campus');
    }
    const now = new Date();
    const defaultEnd = new Date(now);
    defaultEnd.setFullYear(defaultEnd.getFullYear() + 1);
    const inicio = start ? new Date(start) : now;
    const fim = end ? new Date(end) : defaultEnd;
    return this.prisma.event.findMany({
      where: {
        organizationId: context.organizationId,
        status: { in: ['REQUESTED', 'APPROVED'] },
        inicio: { gte: inicio, lte: fim },
        ...(campusId ? { campusId } : this.campusFilter(campusIds)),
      },
      include: {
        campus: true,
        responsiblePerson: true,
        spaces: { include: { space: true } },
        serviceAreas: { include: { serviceArea: true } },
        teams: { include: { team: true } },
      },
      orderBy: { inicio: 'asc' },
    });
  }

  private async accessibleCampusIds(context: OrganizationContext): Promise<string[] | undefined> {
    const user = await this.prisma.user.findFirst({
      where: { id: context.userId, organizationId: context.organizationId },
      include: {
        person: { select: { campusId: true, campusMemberships: { where: { ativo: true }, select: { campusId: true } } } },
        additionalRoles: { select: { role: true } },
      },
    });
    if (!user) {
      throw new ForbiddenException('Usuário sem vínculo organizacional');
    }
    if (hasAnyUserRole(user, ['SECRETARY', 'ADMIN', 'SUPER_ADMIN', 'PASTOR_SENIOR'])) {
      return undefined;
    }
    if (hasAnyUserRole(user, ['PASTOR'])) {
      return pastoralCampusIds(user);
    }
    const coordinations = await this.prisma.cellCampusCoordination.findMany({
      where: {
        personId: context.personId,
        ativo: true,
        campus: { organizationId: context.organizationId },
      },
      select: { campusId: true },
    });
    if (!coordinations.length) {
      throw new ForbiddenException('Sem acesso ao painel pastoral');
    }
    return coordinations.map((coordination) => coordination.campusId);
  }

  private campusFilter(campusIds: string[] | undefined) {
    return campusIds ? { campusId: { in: campusIds } } : {};
  }

  private serviceAreaCampusFilter(campusIds: string[] | undefined) {
    return campusIds ? { OR: [{ scope: 'GLOBAL' as const }, { campusId: { in: campusIds } }] } : {};
  }

  private membershipCampusFilter(campusIds: string[] | undefined) {
    return campusIds
      ? { OR: [{ campusId: { in: campusIds } }, { team: { campusId: { in: campusIds } } }] }
      : {};
  }
}
