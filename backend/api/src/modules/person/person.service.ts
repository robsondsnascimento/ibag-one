import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { UpdatePersonMinisterialTitlesDto } from './dto/update-person-ministerial-titles.dto';

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

    const campusIds = this.uniqueCampusIds(
      createPersonDto.campusId,
      createPersonDto.campusIds,
    );
    await this.assertOrganizationCampuses(campusIds, context.organizationId);


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

        campusMemberships: {
          create: campusIds.map((campusId) => ({
            campusId,
            organizationId: context.organizationId,
          })),
        },

      },

      include: this.personDetails,

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

        campusMemberships: {
          where: { ativo: true },
          include: { campus: true },
          orderBy: { campus: { nome: 'asc' } },
        },

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

        campusMemberships: {
          where: { ativo: true },
          include: { campus: true },
          orderBy: { campus: { nome: 'asc' } },
        },

        serviceMemberships: {
          where: { ativo: true },
          select: {
            id: true,
            role: true,
            inicio: true,
            funcoes: true,
            serviceArea: { select: { id: true, nome: true } },
            team: { select: { id: true, nome: true } },
          },
        },

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


    const primaryCampusId = updatePersonDto.campusId ?? person.campusId;
    const campusIds = updatePersonDto.campusIds
      ? this.uniqueCampusIds(primaryCampusId, updatePersonDto.campusIds)
      : undefined;

    if (campusIds) {
      await this.assertOrganizationCampuses(campusIds, context.organizationId);
    } else if (updatePersonDto.campusId) {
      await this.assertOrganizationCampuses([primaryCampusId], context.organizationId);
    }

    const {
      organizationId: _organizationId,
      campusIds: _campusIds,
      ...personData
    } = updatePersonDto;

    return this.prisma.$transaction(async (transaction) => {
      if (campusIds) {
        await transaction.personCampusMembership.updateMany({
          where: {
            personId: id,
            ativo: true,
            campusId: { notIn: campusIds },
          },
          data: { ativo: false },
        });

        await Promise.all(campusIds.map((campusId) =>
          transaction.personCampusMembership.upsert({
            where: { personId_campusId: { personId: id, campusId } },
            create: {
              personId: id,
              campusId,
              organizationId: context.organizationId,
              ativo: true,
            },
            update: { ativo: true },
          }),
        ));
      } else if (updatePersonDto.campusId) {
        await transaction.personCampusMembership.upsert({
          where: { personId_campusId: { personId: id, campusId: primaryCampusId } },
          create: {
            personId: id,
            campusId: primaryCampusId,
            organizationId: context.organizationId,
            ativo: true,
          },
          update: { ativo: true },
        });
      }

      return transaction.person.update({
        where: { id },
        data: personData,
        include: this.personDetails,
      });
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

  async updateMinisterialTitles(
    id: string,
    dto: UpdatePersonMinisterialTitlesDto,
    context: OrganizationContext,
  ) {
    await this.assertDirectoryManager(context);

    const person = await this.prisma.person.findFirst({
      where: { id, organizationId: context.organizationId },
      select: { id: true },
    });

    if (!person) {
      throw new Error('Pessoa não encontrada na organização atual');
    }

    return this.prisma.person.update({
      where: { id },
      data: { titulosMinisteriais: this.normalizeMinisterialTitles(dto.titulosMinisteriais) },
      include: this.personDetails,
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

  private normalizeMinisterialTitles(titles: string[]) {
    const knownTitles = new Set<string>();
    return titles.reduce<string[]>((normalized, value) => {
      const title = value.trim().replace(/\s+/g, ' ');
      const key = title.toLocaleLowerCase('pt-BR');
      if (title && !knownTitles.has(key)) {
        knownTitles.add(key);
        normalized.push(title);
      }
      return normalized;
    }, []);
  }

  private uniqueCampusIds(primaryCampusId: string, campusIds?: string[]) {
    return [...new Set([primaryCampusId, ...(campusIds ?? [])])];
  }

  private async assertOrganizationCampuses(campusIds: string[], organizationId: string) {
    const campuses = await this.prisma.campus.findMany({
      where: {
        id: { in: campusIds },
        organizationId,
      },
      select: { id: true },
    });
    if (campuses.length !== campusIds.length) {
      throw new BadRequestException(
        'Um ou mais campi não pertencem à organização atual',
      );
    }
  }

  private readonly personDetails = {
    campus: true,
    campusMemberships: {
      where: { ativo: true },
      include: { campus: true },
      orderBy: { campus: { nome: 'asc' } },
    },
  } as const;

}
