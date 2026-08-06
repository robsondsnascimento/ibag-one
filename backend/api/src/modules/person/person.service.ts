import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PersonService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}


  async create(createPersonDto: CreatePersonDto) {

    const organization =
      await this.prisma.organization.findUnique({
        where: {
          id: createPersonDto.organizationId,
        },
      });


    if (!organization) {
      throw new Error(
        'Organização não encontrada',
      );
    }


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
      createPersonDto.organizationId
    ) {
      throw new Error(
        'Campus não pertence à organização informada',
      );
    }


    return await this.prisma.person.create({
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

        organizationId:
          createPersonDto.organizationId,

        campusId:
          createPersonDto.campusId,

      },
    });
  }


  async findAll() {
    return await this.prisma.person.findMany({
      include: {
        campus: true,
        organization: true,
      },
    });
  }


  async findOne(id: string) {
    return await this.prisma.person.findUnique({
      where: {
        id,
      },
      include: {
        campus: true,
        organization: true,
      },
    });
  }


  async update(
    id: string,
    updatePersonDto: UpdatePersonDto,
  ) {
    return await this.prisma.person.update({
      where: {
        id,
      },
      data: updatePersonDto,
    });
  }


  async remove(id: string) {
    return await this.prisma.person.update({
      where: {
        id,
      },
      data: {
        ativo: false,
      },
    });
  }

}
