import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hasAnyUserRole } from '../../common/access/user-role.util';
import { OrganizationContext } from '../../common/context/organization-context';
import { PrismaService } from '../../database/prisma.service';
import { CreateCellNetworkSupervisionDto } from './dto/create-cell-network-supervision.dto';

@Injectable()
export class CellNetworkSupervisionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCellNetworkSupervisionDto, context: OrganizationContext) {
    await this.ensureActivePerson(dto.personId, context.organizationId);
    const network = await this.ensureActiveNetwork(dto.networkId, context.organizationId);
    await this.assertNetworkManagement(network.campusId, context);
    await this.ensureNetworkWithoutActiveSupervisor(dto.networkId);

    return this.prisma.cellNetworkSupervision.create({
      data: {
        personId: dto.personId,
        networkId: dto.networkId,
        ativo: true,
        inicio: new Date(),
      },
      include: this.includeRelations(),
    });
  }

  async findAll(context: OrganizationContext) {
    const campusIds = await this.accessibleCampusIds(context);
    return this.prisma.cellNetworkSupervision.findMany({
      where: {
        network: {
          organizationId: context.organizationId,
          ...(campusIds ? { campusId: { in: campusIds } } : {}),
        },
      },
      include: this.includeRelations(),
      orderBy: { inicio: 'desc' },
    });
  }

  async findOne(id: string, context: OrganizationContext) {
    const supervision = await this.prisma.cellNetworkSupervision.findFirst({
      where: { id, network: { organizationId: context.organizationId } },
      include: this.includeRelations(),
    });
    if (!supervision) {
      throw new NotFoundException('Supervisão de rede não encontrada na organização atual');
    }
    await this.assertNetworkAccess(supervision.network.campusId, context);
    return supervision;
  }

  async end(id: string, context: OrganizationContext) {
    const supervision = await this.prisma.cellNetworkSupervision.findFirst({
      where: { id, ativo: true, network: { organizationId: context.organizationId } },
      include: this.includeRelations(),
    });
    if (!supervision) {
      throw new NotFoundException('Supervisão de rede ativa não encontrada na organização atual');
    }
    await this.assertNetworkManagement(supervision.network.campusId, context);

    return this.prisma.cellNetworkSupervision.update({
      where: { id },
      data: { ativo: false, fim: new Date() },
      include: this.includeRelations(),
    });
  }

  async transfer(id: string, networkId: string, context: OrganizationContext) {
    const supervision = await this.prisma.cellNetworkSupervision.findFirst({
      where: { id, ativo: true, network: { organizationId: context.organizationId } },
      include: this.includeRelations(),
    });
    if (!supervision) {
      throw new NotFoundException('Supervisão de rede ativa não encontrada na organização atual');
    }
    await this.assertNetworkManagement(supervision.network.campusId, context);
    if (supervision.networkId === networkId) {
      throw new BadRequestException('A supervisão já pertence à rede informada');
    }

    const destinationNetwork = await this.ensureActiveNetwork(networkId, context.organizationId);
    await this.assertNetworkManagement(destinationNetwork.campusId, context);
    await this.ensureNetworkWithoutActiveSupervisor(networkId);

    return this.prisma.$transaction(async (tx) => {
      await tx.cellNetworkSupervision.update({
        where: { id },
        data: { ativo: false, fim: new Date() },
      });
      return tx.cellNetworkSupervision.create({
        data: {
          personId: supervision.personId,
          networkId,
          ativo: true,
          inicio: new Date(),
        },
        include: this.includeRelations(),
      });
    });
  }

  private async ensureActivePerson(personId: string, organizationId: string) {
    const person = await this.prisma.person.findFirst({
      where: { id: personId, organizationId, ativo: true },
    });
    if (!person) {
      throw new NotFoundException('Pessoa ativa não encontrada na organização atual');
    }
  }

  private async ensureActiveNetwork(networkId: string, organizationId: string) {
    const network = await this.prisma.cellNetwork.findFirst({
      where: { id: networkId, organizationId, ativo: true },
    });
    if (!network) {
      throw new NotFoundException('Rede ativa não encontrada na organização atual');
    }
    return network;
  }

  private async ensureNetworkWithoutActiveSupervisor(networkId: string) {
    const activeSupervision = await this.prisma.cellNetworkSupervision.findFirst({
      where: { networkId, ativo: true },
    });
    if (activeSupervision) {
      throw new BadRequestException('A rede já possui um supervisor ativo');
    }
  }

  private async assertNetworkManagement(campusId: string, context: OrganizationContext) {
    await this.assertNetworkAccess(campusId, context);
  }

  private async assertNetworkAccess(campusId: string, context: OrganizationContext) {
    const campusIds = await this.accessibleCampusIds(context);
    if (campusIds && !campusIds.includes(campusId)) {
      throw new ForbiddenException('Sem acesso à supervisão desta rede');
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

  private includeRelations() {
    return {
      person: true,
      network: { include: { campus: true } },
    };
  }
}
