import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {

  constructor(
    private prisma: PrismaService,
  ) {}


  async create(
    dto: CreateUserDto,
  ) {

    const person =
      await this.prisma.person.findUnique({
        where: {
          id: dto.personId,
        },

        include: {
          organization: true,
        },
      });


    if (!person) {
      throw new Error(
        'Pessoa não encontrada',
      );
    }


    if (!person.organization) {
      throw new Error(
        'Pessoa sem organização vinculada',
      );
    }


    const loginEmail =
      this.generateLogin(
        person.nome,
        person.organization.dominio,
      );


    const passwordHash =
      await bcrypt.hash(
        dto.password,
        10,
      );


    return this.prisma.user.create({
      data: {

        loginEmail,

        passwordHash,

        personId:
          person.id,

        organizationId:
          person.organization.id,

      },
    });
  }



  async findAllByOrganization(
    organizationId: string,
  ) {

    return this.prisma.user.findMany({
      where: {
        organizationId,
      },

      select: {

        id: true,

        loginEmail: true,

        ativo: true,

        person: {
          select: {
            id: true,
            nome: true,
          },
        },

      },
    });

  }



  private generateLogin(
    nome: string,
    dominio: string,
  ) {

    const normalized =
      nome
        .normalize('NFD')
        .replace(
          /[\u0300-\u036f]/g,
          '',
        )
        .toLowerCase()
        .trim();


    const parts =
      normalized.split(' ');


    return `${parts[0]}.${parts[parts.length - 1]}@${dominio}`;
  }

}
