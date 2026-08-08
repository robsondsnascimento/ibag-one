import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrganizationContext } from '../../common/context/organization-context';
import { UpsertCellLocationDto } from './dto/upsert-cell-location.dto';
@Injectable()
export class CellLocationService {
  constructor(private readonly prisma: PrismaService) {}
  async upsert(cellId: string, dto: UpsertCellLocationDto, context: OrganizationContext) { await this.authorize(cellId, context); return this.prisma.cellLocation.upsert({ where: { cellId }, create: { cellId, ...dto }, update: dto }); }
  async findOne(cellId: string, context: OrganizationContext) { await this.authorize(cellId, context); const location = await this.prisma.cellLocation.findUnique({ where: { cellId } }); if (!location) throw new NotFoundException('Localização da célula não cadastrada'); return location; }
  private async authorize(cellId: string, context: OrganizationContext) {
    const cell = await this.prisma.cell.findFirst({ where: { id: cellId, organizationId: context.organizationId } }); if (!cell) throw new NotFoundException('Célula não encontrada na organização atual');
    const user = await this.prisma.user.findFirst({ where: { id: context.userId, organizationId: context.organizationId } }); if (user && ['SECRETARY', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) return;
    const leadership = await this.prisma.cellLeadership.findFirst({ where: { personId: context.personId, cellId, ativo: true } }); if (leadership) return;
    throw new ForbiddenException('Sem acesso ao endereço desta célula');
  }
}
