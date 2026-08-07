import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

import {
  OrganizationContext,
} from '../../common/context/organization-context';


@Injectable()
export class PersonService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}


  async create(
    createPersonDto: CreatePersonDto,
    context: OrganizationContext,
  ) {

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
  ) {

    return this.prisma.person.findMany({

      where: {

        organizationId:
          context.organizationId,

      },

      include: {

        campus: true,

      },

    });

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

      data: updatePersonDto,

    });

  }


  async remove(
    id: string,
    context: OrganizationContext,
  ) {

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

}
