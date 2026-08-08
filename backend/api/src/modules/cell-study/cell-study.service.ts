import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrganizationContext } from '../../common/context/organization-context';
import { CreateCellStudyDto } from './dto/create-cell-study.dto';
import { userRoleWhere } from '../../common/access/user-role.util';

@Injectable()
export class CellStudyService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateCellStudyDto, file: any, context: OrganizationContext) {
    await this.assertSecretary(context);
    if (!file) throw new NotFoundException('Anexo do estudo é obrigatório');
    const weekStart = this.weekStart(new Date(dto.weekStart));
    return this.prisma.cellStudy.create({ data: { titulo: dto.titulo, descricao: dto.descricao, weekStart, attachmentPath: file.filename, attachmentName: file.originalname, organizationId: context.organizationId } });
  }
  async current(context: OrganizationContext) {
    const membership = await this.prisma.cellMembership.findFirst({ where: { personId: context.personId, ativo: true }, include: { cell: true } });
    if (!membership || membership.cell.organizationId !== context.organizationId) throw new ForbiddenException('Estudo disponível somente para membros ativos de uma célula');
    const start = this.weekStart(new Date());
    const previous = new Date(start); previous.setUTCDate(previous.getUTCDate() - 7);
    const meeting = await this.prisma.cellMeeting.findFirst({ where: { cellId: membership.cellId, data: { gte: previous, lt: start } }, orderBy: { data: 'desc' } });
    if (meeting && !meeting.registroConcluidoEm) throw new ForbiddenException('Conclua o registro do encontro da semana anterior para liberar o estudo');
    const study = await this.prisma.cellStudy.findUnique({ where: { organizationId_weekStart: { organizationId: context.organizationId, weekStart: start } } });
    if (!study) throw new NotFoundException('Estudo desta semana ainda não foi publicado');
    return study;
  }
  private async assertSecretary(context: OrganizationContext) {
    const user = await this.prisma.user.findFirst({ where: { id: context.userId, organizationId: context.organizationId, ...userRoleWhere(['SECRETARY', 'SUPER_ADMIN']) } });
    if (!user) throw new ForbiddenException('Somente o secretário pode publicar estudos');
  }
  private weekStart(date: Date) { const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())); const day = result.getUTCDay(); result.setUTCDate(result.getUTCDate() - (day === 0 ? 6 : day - 1)); return result; }
}
