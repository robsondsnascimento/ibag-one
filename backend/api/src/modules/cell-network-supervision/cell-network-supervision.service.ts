import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { OrganizationContext } from '../../common/context/organization-context';
import { CreateCellNetworkSupervisionDto } from './dto/create-cell-network-supervision.dto';


@Injectable()
export class CellNetworkSupervisionService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}


  async create(
    dto: CreateCellNetworkSupervisionDto,
    context: OrganizationContext,
  ) {

    await this.ensureActivePerson(dto.personId, context.organizationId);
    await this.ensureActiveNetwork(dto.networkId, context.organizationId);


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

    return this.prisma.cellNetworkSupervision.findMany({
      where: {
        network: {
          organizationId: context.organizationId,
        },
      },
      include: this.includeRelations(),
      orderBy: {
        inicio: 'desc',
      },
    });

  }


  async findOne(
    id: string,
    context: OrganizationContext,
  ) {

    const supervision =
      await this.prisma.cellNetworkSupervision.findFirst({
        where: {
          id,
          network: {
            organizationId: context.organizationId,
          },
        },
        include: this.includeRelations(),
      });


    if (!supervision) {

      throw new NotFoundException(
        'Supervisão de rede não encontrada na organização atual',
      );

    }


    return supervision;

  }


  async end(
    id: string,
    context: OrganizationContext,
  ) {

    const supervision =
      await this.prisma.cellNetworkSupervision.findFirst({
        where: {
          id,
          ativo: true,
          network: {
            organizationId: context.organizationId,
          },
        },
      });


    if (!supervision) {

      throw new NotFoundException(
        'Supervisão de rede ativa não encontrada na organização atual',
      );

    }


    return this.prisma.cellNetworkSupervision.update({
      where: { id },
      data: {
        ativo: false,
        fim: new Date(),
      },
      include: this.includeRelations(),
    });

  }


  async transfer(
    id: string,
    networkId: string,
    context: OrganizationContext,
  ) {

    const supervision =
      await this.prisma.cellNetworkSupervision.findFirst({
        where: {
          id,
          ativo: true,
          network: {
            organizationId: context.organizationId,
          },
        },
      });


    if (!supervision) {

      throw new NotFoundException(
        'Supervisão de rede ativa não encontrada na organização atual',
      );

    }


    if (supervision.networkId === networkId) {

      throw new BadRequestException(
        'A supervisão já pertence à rede informada',
      );

    }


    await this.ensureActiveNetwork(networkId, context.organizationId);
    await this.ensureNetworkWithoutActiveSupervisor(networkId);


    return this.prisma.$transaction(async (tx) => {

      await tx.cellNetworkSupervision.update({
        where: { id },
        data: {
          ativo: false,
          fim: new Date(),
        },
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


  private async ensureActivePerson(
    personId: string,
    organizationId: string,
  ) {

    const person = await this.prisma.person.findFirst({
      where: {
        id: personId,
        organizationId,
        ativo: true,
      },
    });


    if (!person) {

      throw new NotFoundException(
        'Pessoa ativa não encontrada na organização atual',
      );

    }

  }


  private async ensureActiveNetwork(
    networkId: string,
    organizationId: string,
  ) {

    const network = await this.prisma.cellNetwork.findFirst({
      where: {
        id: networkId,
        organizationId,
        ativo: true,
      },
    });


    if (!network) {

      throw new NotFoundException(
        'Rede ativa não encontrada na organização atual',
      );

    }

  }


  private async ensureNetworkWithoutActiveSupervisor(
    networkId: string,
  ) {

    const activeSupervision =
      await this.prisma.cellNetworkSupervision.findFirst({
        where: {
          networkId,
          ativo: true,
        },
      });


    if (activeSupervision) {

      throw new BadRequestException(
        'A rede já possui um supervisor ativo',
      );

    }

  }


  private includeRelations() {

    return {
      person: true,
      network: {
        include: {
          campus: true,
        },
      },
    };

  }

}
