import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { CreateCellMembershipDto } from './dto/create-cell-membership.dto';

import {
  OrganizationContext,
} from '../../common/context/organization-context';
import { userRoleWhere } from '../../common/access/user-role.util';


@Injectable()
export class CellMembershipService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}


  async create(
    dto: CreateCellMembershipDto,
    context: OrganizationContext,
  ) {

    await this.assertDirectoryManager(context);

    const person =
      await this.prisma.person.findFirst({
        where: {
          id: dto.personId,
          organizationId:
            context.organizationId,
        },
      });


    if (!person) {

      throw new NotFoundException(
        'Pessoa não encontrada na organização atual',
      );

    }


    const cell =
      await this.prisma.cell.findFirst({
        where: {
          id: dto.cellId,
          organizationId:
            context.organizationId,
        },
      });


    if (!cell) {

      throw new NotFoundException(
        'Célula não encontrada na organização atual',
      );

    }


    const activeMembership =
      await this.prisma.cellMembership.findFirst({
        where: {
          personId: dto.personId,
          ativo: true,
        },
      });


    if (activeMembership) {

      if (activeMembership.cellId === dto.cellId) {

        throw new BadRequestException(
          'A pessoa já possui membresia ativa nesta célula',
        );

      }


      if (!dto.confirmTransfer) {

        throw new ConflictException(
          'A pessoa já possui membresia ativa em outra célula. Confirme a transferência para continuar.',
        );

      }


      return this.prisma.$transaction(async (tx) => {

        await tx.cellMembership.update({
          where: {
            id: activeMembership.id,
          },
          data: {
            ativo: false,
            fim: new Date(),
          },
        });


        return tx.cellMembership.create({
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

      });

    }


    return this.prisma.cellMembership.create({

      data: {

        personId:
          dto.personId,

        cellId:
          dto.cellId,

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

    return this.prisma.cellMembership.findMany({

      where: {

        person: {

          organizationId:
            context.organizationId,

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

  async end(
    id: string,
    context: OrganizationContext,
  ) {

    await this.assertDirectoryManager(context);

    const membership = await this.prisma.cellMembership.findFirst({
      where: {
        id,
        ativo: true,
        cell: {
          organizationId: context.organizationId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException(
        'Membresia ativa não encontrada na organização atual',
      );
    }

    const [leadership, supportRole] = await Promise.all([
      this.prisma.cellLeadership.findFirst({
        where: {
          personId: membership.personId,
          cellId: membership.cellId,
          ativo: true,
        },
      }),
      this.prisma.cellSupportRole.findFirst({
        where: {
          personId: membership.personId,
          cellId: membership.cellId,
          ativo: true,
        },
      }),
    ]);

    if (leadership || supportRole) {
      throw new ConflictException(
        'Encerre primeiro as funções ativas desta pessoa na célula antes de remover sua membresia',
      );
    }

    return this.prisma.cellMembership.update({
      where: { id },
      data: {
        ativo: false,
        fim: new Date(),
      },
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
        'Somente administradores e secretários podem gerenciar membros de células',
      );
    }
  }

}
