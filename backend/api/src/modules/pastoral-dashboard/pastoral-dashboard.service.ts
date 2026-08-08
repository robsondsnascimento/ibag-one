import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrganizationContext } from '../../common/context/organization-context';
@Injectable()
export class PastoralDashboardService {
  constructor(private readonly prisma: PrismaService) {}
  async overview(context: OrganizationContext) {
    await this.authorize(context);
    const now = new Date(); const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())); const day = start.getUTCDay(); start.setUTCDate(start.getUTCDate() - (day === 0 ? 6 : day - 1)); const end = new Date(start); end.setUTCDate(end.getUTCDate() + 7);
    const meetingWhere = { cell: { organizationId: context.organizationId }, data: { gte: start, lt: end } };
    const nextThirtyDays = new Date(now); nextThirtyDays.setDate(nextThirtyDays.getDate() + 30); const nextYear = new Date(now); nextYear.setFullYear(nextYear.getFullYear() + 1);
    const [cells, networks, leaders, meetings, pending, attendance, visitors, multiplications, serviceAreas, serviceTeams, volunteers, schedules, upcomingEvents, eventsNextYear, requestedEvents, spaces] = await Promise.all([
      this.prisma.cell.count({ where: { organizationId: context.organizationId, ativo: true } }),
      this.prisma.cellNetwork.count({ where: { organizationId: context.organizationId, ativo: true } }),
      this.prisma.cellLeadership.count({ where: { ativo: true, cell: { organizationId: context.organizationId } } }),
      this.prisma.cellMeeting.count({ where: meetingWhere }),
      this.prisma.cellMeeting.count({ where: { ...meetingWhere, registroConcluidoEm: null } }),
      this.prisma.cellMeetingAttendance.count({ where: { presente: true, meeting: meetingWhere } }),
      this.prisma.cellMeeting.aggregate({ where: meetingWhere, _sum: { visitantes: true } }),
      this.prisma.cellMultiplication.count({ where: { sourceCell: { organizationId: context.organizationId } } }),
      this.prisma.serviceArea.count({ where: { organizationId: context.organizationId, ativo: true } }),
      this.prisma.serviceTeam.count({ where: { organizationId: context.organizationId, ativo: true } }),
      this.prisma.serviceMembership.count({ where: { ativo: true, serviceArea: { organizationId: context.organizationId } } }),
      this.prisma.serviceSchedule.count({ where: { organizationId: context.organizationId, data: { gte: now, lte: nextThirtyDays }, status: { in: ['SCHEDULED', 'CONFIRMED'] } } }),
      this.prisma.event.count({ where: { organizationId: context.organizationId, status: 'APPROVED', inicio: { gte: now, lte: nextThirtyDays } } }),
      this.prisma.event.count({ where: { organizationId: context.organizationId, status: 'APPROVED', inicio: { gte: now, lte: nextYear } } }),
      this.prisma.event.count({ where: { organizationId: context.organizationId, status: 'REQUESTED' } }),
      this.prisma.space.count({ where: { organizationId: context.organizationId, ativo: true } }),
    ]);
    return { weekStart: start, cells, networks, activeLeaders: leaders, meetings, meetingsAwaitingCompletion: pending, attendance, visitors: visitors._sum.visitantes ?? 0, multiplications, serviceAreas, serviceTeams, activeVolunteerAssignments: volunteers, schedulesNext30Days: schedules, upcomingEventsNext30Days: upcomingEvents, upcomingEventsNextYear: eventsNextYear, eventsAwaitingApproval: requestedEvents, spaces };
  }
  async geography(context: OrganizationContext) {
    await this.authorize(context);
    return this.prisma.cellLocation.findMany({ where: { cell: { organizationId: context.organizationId, ativo: true } }, select: { latitude: true, longitude: true, cell: { select: { id: true, nome: true, campus: { select: { nome: true } }, network: { select: { nome: true } } } } } });
  }
  async cells(context: OrganizationContext) {
    await this.authorize(context);
    const cells = await this.prisma.cell.findMany({ where: { organizationId: context.organizationId }, include: { campus: true, network: true, _count: { select: { sourceMultiplications: true } }, sourceMultiplications: { select: { data: true }, orderBy: { data: 'desc' }, take: 1 } }, orderBy: { nome: 'asc' } });
    return cells.map((cell) => ({ id: cell.id, nome: cell.nome, status: cell.status, campus: cell.campus.nome, network: cell.network?.nome ?? null, multiplicationCount: cell._count.sourceMultiplications, lastMultiplicationAt: cell.sourceMultiplications[0]?.data ?? null }));
  }
  async agenda(start: string | undefined, end: string | undefined, campusId: string | undefined, context: OrganizationContext) {
    await this.authorize(context);
    const now = new Date(); const defaultEnd = new Date(now); defaultEnd.setFullYear(defaultEnd.getFullYear() + 1);
    const inicio = start ? new Date(start) : now; const fim = end ? new Date(end) : defaultEnd;
    return this.prisma.event.findMany({ where: { organizationId: context.organizationId, status: { in: ['REQUESTED', 'APPROVED'] }, inicio: { gte: inicio, lte: fim }, ...(campusId ? { campusId } : {}) }, include: { campus: true, responsiblePerson: true, spaces: { include: { space: true } }, serviceAreas: { include: { serviceArea: true } }, teams: { include: { team: true } } }, orderBy: { inicio: 'asc' } });
  }
  private async authorize(context: OrganizationContext) { const user = await this.prisma.user.findFirst({ where: { id: context.userId, organizationId: context.organizationId } }); if (!user || !['SECRETARY', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) throw new ForbiddenException('Sem acesso ao painel pastoral'); }
}
