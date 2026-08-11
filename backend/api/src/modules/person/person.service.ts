import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

import {
  OrganizationContext,
} from '../../common/context/organization-context';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { paginatedResult } from '../../common/pagination/paginated-result';
import { userRoleWhere } from '../../common/access/user-role.util';


@Injectable()
export class PersonService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}


  async create(
    createPersonDto: CreatePersonDto,
    context: OrganizationContext,
  ) {

    await this.assertDirectoryManager(context);

    const campus =
      await this.prisma.campus.findUnique({
        where: {
          id: createPersonDto.campusId,
        },
      });


    if (!campus) {
      throw new Error(
        'Campus não encontrado',
      );
    }


    if (
      campus.organizationId !==
      context.organizationId
    ) {

      throw new Error(
        'Campus não pertence à organização atual',
      );

    }


    return this.prisma.person.create({

      data: {

        nome:
          createPersonDto.nome,

        sexo:
          createPersonDto.sexo,

        dataNascimento:
          createPersonDto.dataNascimento,

        cpf:
          createPersonDto.cpf,

        telefone:
          createPersonDto.telefone,

        email:
          createPersonDto.email,

        dataDecisao:
          createPersonDto.dataDecisao,

        dataBatismo:
          createPersonDto.dataBatismo,

        dataMembresia:
          createPersonDto.dataMembresia,

        ativo:
          createPersonDto.ativo,

        campusId:
          createPersonDto.campusId,

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
      this.prisma.person.findMany({

      where,

      include: {

        campus: true,

      },

      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,

      }),
      this.prisma.person.count({ where }),
    ]);

    return paginatedResult(data, total, pagination);

  }


  async findOne(
    id: string,
    context: OrganizationContext,
  ) {

    return this.prisma.person.findFirst({

      where: {

        id,

        organizationId:
          context.organizationId,

      },

      include: {

        campus: true,

      },

    });

  }


  async update(
    id: string,
    updatePersonDto: UpdatePersonDto,
    context: OrganizationContext,
  ) {

    await this.assertDirectoryManager(context);

    const person =
      await this.prisma.person.findFirst({

        where: {

          id,

          organizationId:
            context.organizationId,

        },

      });


    if (!person) {

      throw new Error(
        'Pessoa não encontrada na organização atual',
      );

    }


    if (updatePersonDto.campusId) {
      const campus = await this.prisma.campus.findFirst({
        where: {
          id: updatePersonDto.campusId,
          organizationId: context.organizationId,
        },
      });

      if (!campus) {
        throw new BadRequestException(
          'Campus não pertence à organização atual',
        );
      }
    }

    const { organizationId: _organizationId, ...personData } = updatePersonDto;

    return this.prisma.person.update({

      where: {

        id,

      },

      data: personData,

      include: {
        campus: true,
      },

    });

  }


  async remove(
    id: string,
    context: OrganizationContext,
  ) {

    await this.assertDirectoryManager(context);

    const person =
      await this.prisma.person.findFirst({

        where: {

          id,

          organizationId:
            context.organizationId,

        },

      });


    if (!person) {

      throw new Error(
        'Pessoa não encontrada na organização atual',
      );

    }


    return this.prisma.person.update({

      where: {

        id,

      },

      data: {

        ativo: false,

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
        'Somente administradores e secretários podem gerenciar cadastros de pessoas',
      );
    }
  }

}
