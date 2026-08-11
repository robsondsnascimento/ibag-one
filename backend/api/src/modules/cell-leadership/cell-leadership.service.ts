import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { CreateCellLeadershipDto } from './dto/create-cell-leadership.dto';

import {
  OrganizationContext,
} from '../../common/context/organization-context';
import { userRoleWhere } from '../../common/access/user-role.util';


@Injectable()
export class CellLeadershipService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}


  async create(
    dto: CreateCellLeadershipDto,
    context: OrganizationContext,
  ) {

    await this.assertDirectoryManager(context);

    const person =
      await this.prisma.person.findFirst({
        where: {
          id: dto.personId,
          organizationId: context.organizationId,
          ativo: true,
        },
      });


    if (!person) {

      throw new NotFoundException(
        'Pessoa ativa não encontrada na organização atual',
      );

    }


    const cell =
      await this.prisma.cell.findFirst({
        where: {
          id: dto.cellId,
          organizationId: context.organizationId,
          ativo: true,
        },
      });


    if (!cell) {

      throw new NotFoundException(
        'Célula ativa não encontrada na organização atual',
      );

    }


    const activeMembership =
      await this.prisma.cellMembership.findFirst({
        where: {
          personId: dto.personId,
          cellId: dto.cellId,
          ativo: true,
        },
      });


    if (!activeMembership) {

      throw new BadRequestException(
        'A pessoa precisa possuir membresia ativa nesta célula para assumir a liderança',
      );

    }


    const activeLeadership =
      await this.prisma.cellLeadership.findFirst({
        where: {
          personId: dto.personId,
          cellId: dto.cellId,
          ativo: true,
        },
      });


    if (activeLeadership) {

      throw new BadRequestException(
        'A pessoa já possui uma liderança ativa nesta célula',
      );

    }


    return this.prisma.cellLeadership.create({
      data: {
        personId: dto.personId,
        cellId: dto.cellId,
        ativo: true,
        inicio: new Date(),
      },
      include: {
        person: true,
        cell: {
          include: {
            campus: true,
          },
        },
      },
    });

  }


  async findAll(
    context: OrganizationContext,
  ) {

    return this.prisma.cellLeadership.findMany({
      where: {
        person: {
          organizationId: context.organizationId,
        },
      },
      include: {
        person: true,
        cell: {
          include: {
            campus: true,
          },
        },
      },
      orderBy: {
        inicio: 'desc',
      },
    });

  }


  async findOne(
    id: string,
    context: OrganizationContext,
  ) {

    const leadership =
      await this.prisma.cellLeadership.findFirst({
        where: {
          id,
          person: {
            organizationId: context.organizationId,
          },
          cell: {
            organizationId: context.organizationId,
          },
        },
        include: {
          person: true,
          cell: {
            include: {
              campus: true,
            },
          },
        },
      });


    if (!leadership) {

      throw new NotFoundException(
        'Liderança de célula não encontrada na organização atual',
      );

    }


    return leadership;

  }


  async end(
    id: string,
    context: OrganizationContext,
  ) {

    await this.assertDirectoryManager(context);

    const leadership =
      await this.prisma.cellLeadership.findFirst({
        where: {
          id,
          ativo: true,
          person: {
            organizationId: context.organizationId,
          },
          cell: {
            organizationId: context.organizationId,
          },
        },
      });


    if (!leadership) {

      throw new NotFoundException(
        'Liderança de célula ativa não encontrada na organização atual',
      );

    }


    return this.prisma.cellLeadership.update({
      where: {
        id,
      },
      data: {
        ativo: false,
        fim: new Date(),
      },
      include: {
        person: true,
        cell: {
          include: {
            campus: true,
          },
        },
      },
    });

  }


  async transfer(
    id: string,
    cellId: string,
    context: OrganizationContext,
  ) {

    await this.assertDirectoryManager(context);

    const leadership =
      await this.prisma.cellLeadership.findFirst({
        where: {
          id,
          ativo: true,
          person: {
            organizationId: context.organizationId,
          },
          cell: {
            organizationId: context.organizationId,
          },
        },
      });


    if (!leadership) {

      throw new NotFoundException(
        'Liderança de célula ativa não encontrada na organização atual',
      );

    }


    if (leadership.cellId === cellId) {

      throw new BadRequestException(
        'A liderança já pertence à célula informada',
      );

    }


    const targetCell =
      await this.prisma.cell.findFirst({
        where: {
          id: cellId,
          organizationId: context.organizationId,
          ativo: true,
        },
      });


    if (!targetCell) {

      throw new NotFoundException(
        'Célula de destino ativa não encontrada na organização atual',
      );

    }


    const activeMembership =
      await this.prisma.cellMembership.findFirst({
        where: {
          personId: leadership.personId,
          cellId,
          ativo: true,
        },
      });


    if (!activeMembership) {

      throw new BadRequestException(
        'A pessoa precisa possuir membresia ativa na célula de destino',
      );

    }


    const activeLeadership =
      await this.prisma.cellLeadership.findFirst({
        where: {
          personId: leadership.personId,
          cellId,
          ativo: true,
        },
      });


    if (activeLeadership) {

      throw new BadRequestException(
        'A pessoa já possui uma liderança ativa na célula de destino',
      );

    }


    return this.prisma.$transaction(async (tx) => {

      await tx.cellLeadership.update({
        where: {
          id,
        },
        data: {
          ativo: false,
          fim: new Date(),
        },
      });


      return tx.cellLeadership.create({
        data: {
          personId: leadership.personId,
          cellId,
          ativo: true,
          inicio: new Date(),
        },
        include: {
          person: true,
          cell: {
            include: {
              campus: true,
            },
          },
        },
      });

    });

  }

  private async assertDirectoryManager(context: OrganizationContext) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: context.userId,
        organizationId: context.organizationId,
        ...userRoleWhere(['SECRETARY', 'ADMIN', 'SUPER_ADMIN']),
      },
    });

    if (!user) {
      throw new ForbiddenException(
        'Somente administradores e secretários podem gerenciar lideranças de células',
      );
    }
  }

}
