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
    const [cells, networks, leaders, meetings, pending, attendance, visitors, multiplications] = await Promise.all([
      this.prisma.cell.count({ where: { organizationId: context.organizationId, ativo: true } }),
      this.prisma.cellNetwork.count({ where: { organizationId: context.organizationId, ativo: true } }),
      this.prisma.cellLeadership.count({ where: { ativo: true, cell: { organizationId: context.organizationId } } }),
      this.prisma.cellMeeting.count({ where: meetingWhere }),
      this.prisma.cellMeeting.count({ where: { ...meetingWhere, registroConcluidoEm: null } }),
      this.prisma.cellMeetingAttendance.count({ where: { presente: true, meeting: meetingWhere } }),
      this.prisma.cellMeeting.aggregate({ where: meetingWhere, _sum: { visitantes: true } }),
      this.prisma.cellMultiplication.count({ where: { sourceCell: { organizationId: context.organizationId } } }),
    ]);
    return { weekStart: start, cells, networks, activeLeaders: leaders, meetings, meetingsAwaitingCompletion: pending, attendance, visitors: visitors._sum.visitantes ?? 0, multiplications };
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
  private async authorize(context: OrganizationContext) { const user = await this.prisma.user.findFirst({ where: { id: context.userId, organizationId: context.organizationId } }); if (!user || !['SECRETARY', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) throw new ForbiddenException('Sem acesso ao painel pastoral'); }
}
