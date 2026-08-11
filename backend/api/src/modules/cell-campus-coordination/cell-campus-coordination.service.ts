import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { hasAnyUserRole, pastoralCampusIds } from '../../common/access/user-role.util';
import { OrganizationContext } from '../../common/context/organization-context';
import { PrismaService } from '../../database/prisma.service';
import { CreateCellCampusCoordinationDto } from './dto/create-cell-campus-coordination.dto';
import { TransferCellCampusCoordinationDto } from './dto/transfer-cell-campus-coordination.dto';

@Injectable()
export class CellCampusCoordinationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCellCampusCoordinationDto, context: OrganizationContext) {
    await this.person(dto.personId, context);
    await this.campus(dto.campusId, context);
    await this.assertManagementCampus(dto.campusId, context);
    const existing = await this.prisma.cellCampusCoordination.findFirst({ where: { personId: dto.personId, campusId: dto.campusId, ativo: true } });
    if (existing) throw new BadRequestException('A pessoa já possui coordenação de células ativa neste campus');
    return this.prisma.cellCampusCoordination.create({ data: { personId: dto.personId, campusId: dto.campusId, ativo: true, inicio: new Date() }, include: this.details });
  }

  async findAll(context: OrganizationContext) {
    const campusIds = await this.accessibleCampusIds(context);
    return this.prisma.cellCampusCoordination.findMany({
      where: { campus: { organizationId: context.organizationId, ...(campusIds ? { id: { in: campusIds } } : {}) } },
      include: this.details,
      orderBy: { inicio: 'desc' },
    });
  }

  async findOne(id: string, context: OrganizationContext) {
    const coordination = await this.prisma.cellCampusCoordination.findFirst({ where: { id, campus: { organizationId: context.organizationId } }, include: this.details });
    if (!coordination) throw new NotFoundException('Coordenação de células não encontrada na organização atual');
    await this.assertCampusAccess(coordination.campusId, context);
    return coordination;
  }

  async end(id: string, context: OrganizationContext) {
    const coordination = await this.prisma.cellCampusCoordination.findFirst({ where: { id, ativo: true, campus: { organizationId: context.organizationId } } });
    if (!coordination) throw new NotFoundException('Coordenação de células ativa não encontrada na organização atual');
    await this.assertManagementCampus(coordination.campusId, context);
    return this.prisma.cellCampusCoordination.update({ where: { id }, data: { ativo: false, fim: new Date() }, include: this.details });
  }

  async transfer(id: string, dto: TransferCellCampusCoordinationDto, context: OrganizationContext) {
    const coordination = await this.prisma.cellCampusCoordination.findFirst({ where: { id, ativo: true, campus: { organizationId: context.organizationId } } });
    if (!coordination) throw new NotFoundException('Coordenação de células ativa não encontrada na organização atual');
    await this.assertManagementCampus(coordination.campusId, context);
    if (coordination.campusId === dto.campusId) throw new BadRequestException('A coordenação já pertence ao campus informado');
    await this.campus(dto.campusId, context);
    await this.assertManagementCampus(dto.campusId, context);
    const existing = await this.prisma.cellCampusCoordination.findFirst({ where: { personId: coordination.personId, campusId: dto.campusId, ativo: true } });
    if (existing) throw new BadRequestException('A pessoa já possui coordenação de células ativa no campus de destino');
    return this.prisma.$transaction(async transaction => {
      await transaction.cellCampusCoordination.update({ where: { id: coordination.id }, data: { ativo: false, fim: new Date() } });
      return transaction.cellCampusCoordination.create({ data: { personId: coordination.personId, campusId: dto.campusId, ativo: true, inicio: new Date() }, include: this.details });
    });
  }

  private async person(id: string, context: OrganizationContext) {
    const person = await this.prisma.person.findFirst({ where: { id, organizationId: context.organizationId, ativo: true } });
    if (!person) throw new NotFoundException('Pessoa ativa não encontrada na organização atual');
    return person;
  }

  private async campus(id: string, context: OrganizationContext) {
    const campus = await this.prisma.campus.findFirst({ where: { id, organizationId: context.organizationId, ativo: true } });
    if (!campus) throw new NotFoundException('Campus ativo não encontrado na organização atual');
    return campus;
  }

  private async accessibleCampusIds(context: OrganizationContext): Promise<string[] | undefined> {
    const user = await this.prisma.user.findFirst({
      where: { id: context.userId, organizationId: context.organizationId },
      include: { person: { select: { campusId: true, campusMemberships: { where: { ativo: true }, select: { campusId: true } } } }, additionalRoles: { select: { role: true } } },
    });
    if (!user) throw new ForbiddenException('Usuário sem vínculo organizacional');
    if (hasAnyUserRole(user, ['SECRETARY', 'ADMIN', 'SUPER_ADMIN', 'PASTOR_SENIOR'])) return undefined;
    if (hasAnyUserRole(user, ['PASTOR'])) return pastoralCampusIds(user);
    const coordinations = await this.prisma.cellCampusCoordination.findMany({ where: { personId: context.personId, ativo: true, campus: { organizationId: context.organizationId } }, select: { campusId: true } });
    if (!coordinations.length) throw new ForbiddenException('Sem acesso à coordenação de células');
    return coordinations.map(coordination => coordination.campusId);
  }

  private async assertManagementCampus(campusId: string, context: OrganizationContext) {
    const campusIds = await this.accessibleCampusIds(context);
    if (campusIds && !campusIds.includes(campusId)) {
      throw new ForbiddenException('Sem permissão para administrar coordenações neste campus');
    }
  }

  private async assertCampusAccess(campusId: string, context: OrganizationContext) {
    const campusIds = await this.accessibleCampusIds(context);
    if (campusIds && !campusIds.includes(campusId)) throw new ForbiddenException('Sem acesso à coordenação deste campus');
  }

  private readonly details = { person: true, campus: true } as const;
}
