import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import {
  OrganizationContext,
} from '../../common/context/organization-context';

import {
  CreateCellNetworkDto,
} from './dto/create-cell-network.dto';

import {
  UpdateCellNetworkDto,
} from './dto/update-cell-network.dto';


@Injectable()
export class CellNetworkService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}


  async create(
    dto: CreateCellNetworkDto,
    context: OrganizationContext,
  ) {

    await this.ensureCampus(
      dto.campusId,
      context.organizationId,
    );


    const existingNetwork =
      await this.prisma.cellNetwork.findFirst({
        where: {
          nome: dto.nome,
          campusId: dto.campusId,
          ativo: true,
        },
      });


    if (existingNetwork) {

      throw new BadRequestException(
        'Já existe uma rede ativa com este nome neste campus',
      );

    }


    return this.prisma.cellNetwork.create({
      data: {
        nome: dto.nome,
        descricao: dto.descricao,
        ativo: dto.ativo ?? true,
        campusId: dto.campusId,
        organizationId: context.organizationId,
      },
      include: {
        campus: true,
      },
    });

  }


  async findAll(
    context: OrganizationContext,
  ) {

    return this.prisma.cellNetwork.findMany({
      where: {
        organizationId: context.organizationId,
      },
      include: {
        campus: true,
        _count: {
          select: {
            cells: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    });

  }


  async findOne(
    id: string,
    context: OrganizationContext,
  ) {

    const network =
      await this.prisma.cellNetwork.findFirst({
        where: {
          id,
          organizationId: context.organizationId,
        },
        include: {
          campus: true,
          cells: {
            include: {
              campus: true,
            },
            orderBy: {
              nome: 'asc',
            },
          },
        },
      });


    if (!network) {

      throw new NotFoundException(
        'Rede de células não encontrada na organização atual',
      );

    }


    return network;

  }


  async update(
    id: string,
    dto: UpdateCellNetworkDto,
    context: OrganizationContext,
  ) {

    const network = await this.findOne(id, context);


    if (dto.campusId && dto.campusId !== network.campusId) {

      await this.ensureCampus(
        dto.campusId,
        context.organizationId,
      );


      if (network.cells.length > 0) {

        throw new BadRequestException(
          'Não é possível alterar o campus de uma rede que possui células vinculadas',
        );

      }

    }


    if (dto.nome || dto.campusId) {

      const existingNetwork =
        await this.prisma.cellNetwork.findFirst({
          where: {
            nome: dto.nome ?? network.nome,
            campusId: dto.campusId ?? network.campusId,
            ativo: true,
            NOT: {
              id,
            },
          },
        });


      if (existingNetwork) {

        throw new BadRequestException(
          'Já existe uma rede ativa com este nome neste campus',
        );

      }

    }


    return this.prisma.cellNetwork.update({
      where: {
        id,
      },
      data: dto,
      include: {
        campus: true,
      },
    });

  }


  async remove(
    id: string,
    context: OrganizationContext,
  ) {

    await this.findOne(id, context);


    return this.prisma.cellNetwork.update({
      where: {
        id,
      },
      data: {
        ativo: false,
      },
    });

  }


  async assignCell(
    id: string,
    cellId: string,
    context: OrganizationContext,
  ) {

    const network = await this.findOne(id, context);


    if (!network.ativo) {

      throw new BadRequestException(
        'Não é possível vincular células a uma rede inativa',
      );

    }


    const cell = await this.prisma.cell.findFirst({
      where: {
        id: cellId,
        organizationId: context.organizationId,
      },
    });


    if (!cell) {

      throw new NotFoundException(
        'Célula não encontrada na organização atual',
      );

    }


    if (cell.campusId !== network.campusId) {

      throw new BadRequestException(
        'A célula deve pertencer ao mesmo campus da rede',
      );

    }


    return this.prisma.cell.update({
      where: {
        id: cellId,
      },
      data: {
        networkId: id,
      },
      include: {
        campus: true,
        network: true,
      },
    });

  }


  async unassignCell(
    id: string,
    cellId: string,
    context: OrganizationContext,
  ) {

    await this.findOne(id, context);


    const cell = await this.prisma.cell.findFirst({
      where: {
        id: cellId,
        organizationId: context.organizationId,
        networkId: id,
      },
    });


    if (!cell) {

      throw new NotFoundException(
        'Célula não está vinculada a esta rede',
      );

    }


    return this.prisma.cell.update({
      where: {
        id: cellId,
      },
      data: {
        networkId: null,
      },
      include: {
        campus: true,
        network: true,
      },
    });

  }


  private async ensureCampus(
    campusId: string,
    organizationId: string,
  ) {

    const campus = await this.prisma.campus.findFirst({
      where: {
        id: campusId,
        organizationId,
      },
    });


    if (!campus) {

      throw new NotFoundException(
        'Campus não encontrado na organização atual',
      );

    }


    return campus;

  }

}
