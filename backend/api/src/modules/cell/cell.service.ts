import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { CreateCellDto } from './dto/create-cell.dto';
import { UpdateCellDto } from './dto/update-cell.dto';

import {
  OrganizationContext,
} from '../../common/context/organization-context';
import { CellStatus } from '../../generated/prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { paginatedResult } from '../../common/pagination/paginated-result';


@Injectable()
export class CellService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}


  async create(
    createCellDto: CreateCellDto,
    context: OrganizationContext,
  ) {

    const campus =
      await this.prisma.campus.findFirst({
        where: {
          id: createCellDto.campusId,
          organizationId: context.organizationId,
        },
      });


    if (!campus) {

      throw new BadRequestException(
        'Campus não pertence à organização atual',
      );

    }


    return this.prisma.cell.create({

      data: {

        nome:
          createCellDto.nome,

        descricao:
          createCellDto.descricao,

        ativo:
          createCellDto.ativo ?? true,

        campusId:
          createCellDto.campusId,

        meetingDay:
          createCellDto.meetingDay,

        meetingTime:
          createCellDto.meetingTime,

        organizationId:
          context.organizationId,

      },

    });

  }


  async findAll(
    context: OrganizationContext,
    pagination: PaginationQueryDto,
  ) {

    const where = {
      organizationId: context.organizationId,
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.cell.findMany({

      where,

      include: {

        campus: true,

        motherCell: {
          select: {
            id: true,
            nome: true,
          },
        },

      },

      orderBy: {

        nome: 'asc',

      },

      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,

      }),
      this.prisma.cell.count({ where }),
    ]);

    return paginatedResult(data, total, pagination);

  }


  async findOne(
    id: string,
    context: OrganizationContext,
  ) {

    const cell =
      await this.prisma.cell.findFirst({

        where: {

          id,

          organizationId:
            context.organizationId,

        },

        include: {

          campus: true,

          motherCell: {
            select: {
              id: true,
              nome: true,
            },
          },

        },

      });


    if (!cell) {

      throw new NotFoundException(
        'Célula não encontrada na organização atual',
      );

    }


    return cell;

  }


  async update(
    id: string,
    updateCellDto: UpdateCellDto,
    context: OrganizationContext,
  ) {

    const cell =
      await this.prisma.cell.findFirst({

        where: {

          id,

          organizationId:
            context.organizationId,

        },

      });


    if (!cell) {

      throw new NotFoundException(
        'Célula não encontrada na organização atual',
      );

    }


    if (updateCellDto.campusId) {

      const campus =
        await this.prisma.campus.findFirst({

          where: {

            id: updateCellDto.campusId,

            organizationId:
              context.organizationId,

          },

        });


      if (!campus) {

        throw new BadRequestException(
          'Campus não pertence à organização atual',
        );

      }

    }


    return this.prisma.cell.update({

      where: {

        id,

      },

      data: updateCellDto,

      include: {

        campus: true,

      },

    });

  }


  async remove(
    id: string,
    context: OrganizationContext,
  ) {

    const cell =
      await this.prisma.cell.findFirst({

        where: {

          id,

          organizationId:
            context.organizationId,

        },

      });


    if (!cell) {

      throw new NotFoundException(
        'Célula não encontrada na organização atual',
      );

    }


    return this.prisma.cell.update({

      where: {

        id,

      },

      data: {

        ativo: false,

      },

    });

  }

  async updateStatus(id: string, status: CellStatus, context: OrganizationContext) {
    await this.findOne(id, context);
    return this.prisma.cell.update({ where: { id }, data: { status, ativo: ['ACTIVE', 'PLANNING'].includes(status) } });
  }

}
