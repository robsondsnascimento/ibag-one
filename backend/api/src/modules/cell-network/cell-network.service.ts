import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hasAnyUserRole } from '../../common/access/user-role.util';
import { OrganizationContext } from '../../common/context/organization-context';
import { PrismaService } from '../../database/prisma.service';
import { CreateCellNetworkDto } from './dto/create-cell-network.dto';
import { UpdateCellNetworkDto } from './dto/update-cell-network.dto';

@Injectable()
export class CellNetworkService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCellNetworkDto, context: OrganizationContext) {
    await this.ensureCampus(dto.campusId, context.organizationId);
    await this.assertNetworkManagement(dto.campusId, context);

    const existingNetwork = await this.prisma.cellNetwork.findFirst({
      where: { nome: dto.nome, campusId: dto.campusId, ativo: true },
    });
    if (existingNetwork) {
      throw new BadRequestException('Já existe uma rede ativa com este nome neste campus');
    }

    return this.prisma.cellNetwork.create({
      data: {
        nome: dto.nome,
        descricao: dto.descricao,
        ativo: dto.ativo ?? true,
        campusId: dto.campusId,
        organizationId: context.organizationId,
      },
      include: { campus: true },
    });
  }

  async findAll(context: OrganizationContext) {
    const campusIds = await this.accessibleCampusIds(context);
    return this.prisma.cellNetwork.findMany({
      where: {
        organizationId: context.organizationId,
        ...(campusIds ? { campusId: { in: campusIds } } : {}),
      },
      include: {
        campus: true,
        cells: {
          select: {
            id: true,
            nome: true,
          },
          orderBy: { nome: 'asc' },
        },
        _count: { select: { cells: true } },
      },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string, context: OrganizationContext) {
    const network = await this.prisma.cellNetwork.findFirst({
      where: { id, organizationId: context.organizationId },
      include: {
        campus: true,
        cells: {
          include: { campus: true },
          orderBy: { nome: 'asc' },
        },
      },
    });
    if (!network) {
      throw new NotFoundException('Rede de células não encontrada na organização atual');
    }
    await this.assertNetworkAccess(network.campusId, context);
    return network;
  }

  async update(id: string, dto: UpdateCellNetworkDto, context: OrganizationContext) {
    const network = await this.findOne(id, context);
    await this.assertNetworkManagement(network.campusId, context);

    if (dto.campusId && dto.campusId !== network.campusId) {
      await this.ensureCampus(dto.campusId, context.organizationId);
      await this.assertNetworkManagement(dto.campusId, context);
      if (network.cells.length > 0) {
        throw new BadRequestException('Não é possível alterar o campus de uma rede que possui células vinculadas');
      }
    }

    if (dto.nome || dto.campusId) {
      const existingNetwork = await this.prisma.cellNetwork.findFirst({
        where: {
          nome: dto.nome ?? network.nome,
          campusId: dto.campusId ?? network.campusId,
          ativo: true,
          NOT: { id },
        },
      });
      if (existingNetwork) {
        throw new BadRequestException('Já existe uma rede ativa com este nome neste campus');
      }
    }

    return this.prisma.cellNetwork.update({
      where: { id },
      data: dto,
      include: { campus: true },
    });
  }

  async remove(id: string, context: OrganizationContext) {
    const network = await this.findOne(id, context);
    await this.assertNetworkManagement(network.campusId, context);
    return this.prisma.cellNetwork.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async assignCell(id: string, cellId: string, context: OrganizationContext) {
    const network = await this.findOne(id, context);
    await this.assertNetworkManagement(network.campusId, context);
    if (!network.ativo) {
      throw new BadRequestException('Não é possível vincular células a uma rede inativa');
    }

    const cell = await this.prisma.cell.findFirst({
      where: { id: cellId, organizationId: context.organizationId },
    });
    if (!cell) {
      throw new NotFoundException('Célula não encontrada na organização atual');
    }
    if (cell.campusId !== network.campusId) {
      throw new BadRequestException('A célula deve pertencer ao mesmo campus da rede');
    }

    return this.prisma.cell.update({
      where: { id: cellId },
      data: { networkId: id },
      include: { campus: true, network: true },
    });
  }

  async unassignCell(id: string, cellId: string, context: OrganizationContext) {
    const network = await this.findOne(id, context);
    await this.assertNetworkManagement(network.campusId, context);

    const cell = await this.prisma.cell.findFirst({
      where: { id: cellId, organizationId: context.organizationId, networkId: id },
    });
    if (!cell) {
      throw new NotFoundException('Célula não está vinculada a esta rede');
    }

    return this.prisma.cell.update({
      where: { id: cellId },
      data: { networkId: null },
      include: { campus: true, network: true },
    });
  }

  private async ensureCampus(campusId: string, organizationId: string) {
    const campus = await this.prisma.campus.findFirst({
      where: { id: campusId, organizationId },
    });
    if (!campus) {
      throw new NotFoundException('Campus não encontrado na organização atual');
    }
    return campus;
  }

  private async assertNetworkManagement(campusId: string, context: OrganizationContext) {
    const user = await this.prisma.user.findFirst({
      where: { id: context.userId, organizationId: context.organizationId },
      include: {
        person: { select: { campusId: true } },
        additionalRoles: { select: { role: true } },
      },
    });
    if (!user) {
      throw new ForbiddenException('Usuário sem vínculo organizacional');
    }
    if (hasAnyUserRole(user, ['SECRETARY', 'ADMIN', 'SUPER_ADMIN', 'PASTOR_SENIOR'])) {
      return;
    }
    if (hasAnyUserRole(user, ['PASTOR']) && user.person.campusId === campusId) {
      return;
    }
    throw new ForbiddenException('Sem permissão para administrar redes neste campus');
  }

  private async assertNetworkAccess(campusId: string, context: OrganizationContext) {
    const campusIds = await this.accessibleCampusIds(context);
    if (campusIds && !campusIds.includes(campusId)) {
      throw new ForbiddenException('Sem acesso às redes deste campus');
    }
  }

  private async accessibleCampusIds(context: OrganizationContext): Promise<string[] | undefined> {
    const user = await this.prisma.user.findFirst({
      where: { id: context.userId, organizationId: context.organizationId },
      include: {
        person: { select: { campusId: true } },
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
      return [user.person.campusId];
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
      throw new ForbiddenException('Sem acesso à coordenação de células');
    }
    return coordinations.map((coordination) => coordination.campusId);
  }
}
