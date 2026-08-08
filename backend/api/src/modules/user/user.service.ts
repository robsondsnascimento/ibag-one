import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrganizationContext } from '../../common/context/organization-context';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';


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

        role: true,

        person: {
          select: {
            id: true,
            nome: true,
          },
        },

      },
    });

  }

  async updateRole(id: string, dto: UpdateUserRoleDto, context: OrganizationContext) {
    const administrator = await this.prisma.user.findFirst({ where: { id: context.userId, organizationId: context.organizationId, role: { in: ['ADMIN', 'SUPER_ADMIN'] } } });
    if (!administrator) throw new ForbiddenException('Somente administradores podem alterar perfis');
    const user = await this.prisma.user.findFirst({ where: { id, organizationId: context.organizationId } });
    if (!user) throw new NotFoundException('Usuário não encontrado na organização atual');
    return this.prisma.user.update({ where: { id }, data: { role: dto.role }, select: { id: true, loginEmail: true, role: true } });
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
