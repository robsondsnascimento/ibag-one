import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreatePersonLoginDto } from './dto/create-person-login.dto';
import * as bcrypt from 'bcrypt';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrganizationContext } from '../../common/context/organization-context';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { AssignUserRoleDto } from './dto/assign-user-role.dto';
import { UserRole } from '../../generated/prisma/client';
import { userRoleWhere } from '../../common/access/user-role.util';


@Injectable()
export class UserService {

  constructor(
    private prisma: PrismaService,
  ) {}


  async createForPerson(personId: string, dto: CreatePersonLoginDto, context: OrganizationContext) {
    await this.assertAdministrator(context);
    const person = await this.prisma.person.findFirst({
      where: { id: personId, organizationId: context.organizationId, ativo: true },
      include: { organization: true },
    });
    if (!person) throw new NotFoundException('Pessoa ativa não encontrada na organização atual');
    if (!person.organization) throw new ForbiddenException('Pessoa sem organização vinculada');
    const existing = await this.prisma.user.findUnique({ where: { personId: person.id } });
    if (existing) throw new ForbiddenException('Esta pessoa já possui acesso ao sistema');

    const loginEmail = await this.generateAvailableLogin(person.nome, person.organization.dominio);
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        loginEmail,
        passwordHash,
        personId: person.id,
        organizationId: context.organizationId,
      },
      select: { id: true, loginEmail: true, ativo: true, role: true },
    });
  }

  async findByPerson(personId: string, context: OrganizationContext) {
    await this.assertAdministrator(context);
    return this.prisma.user.findFirst({
      where: { personId, organizationId: context.organizationId },
      select: { id: true, loginEmail: true, ativo: true, role: true },
    });
  }

  async changeOwnPassword(dto: { currentPassword: string; newPassword: string }, context: OrganizationContext) {
    const user = await this.prisma.user.findFirst({
      where: { id: context.userId, organizationId: context.organizationId, ativo: true },
      select: { id: true, passwordHash: true },
    });
    if (!user) throw new NotFoundException('Usuário ativo não encontrado na organização atual');

    const currentPasswordMatches = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!currentPasswordMatches) throw new ForbiddenException('A senha atual não confere');
    if (dto.currentPassword === dto.newPassword) throw new BadRequestException('A nova senha deve ser diferente da senha atual');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(dto.newPassword, 10) },
    });

    return { changed: true };
  }

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

    const users = await this.prisma.user.findMany({
      where: {
        organizationId,
      },

      select: {

        id: true,

        loginEmail: true,

        ativo: true,

        role: true,

        additionalRoles: {
          select: {
            role: true,
          },
        },

        person: {
          select: {
            id: true,
            nome: true,
          },
        },

      },
    });

    return users.map(({ additionalRoles, ...user }) => ({
      ...user,
      roles: [...new Set([user.role, ...additionalRoles.map(assignment => assignment.role)])],
    }));

  }

  async updateRole(id: string, dto: UpdateUserRoleDto, context: OrganizationContext) {
    const administrator = await this.prisma.user.findFirst({ where: { id: context.userId, organizationId: context.organizationId, ...userRoleWhere([UserRole.ADMIN, UserRole.SUPER_ADMIN]) } });
    if (!administrator) throw new ForbiddenException('Somente administradores podem alterar perfis');
    const user = await this.prisma.user.findFirst({ where: { id, organizationId: context.organizationId } });
    if (!user) throw new NotFoundException('Usuário não encontrado na organização atual');
    return this.prisma.user.update({ where: { id }, data: { role: dto.role }, select: { id: true, loginEmail: true, role: true } });
  }

  async assignAdditionalRole(id: string, dto: AssignUserRoleDto, context: OrganizationContext) {
    await this.assertAdministrator(context);
    const user = await this.prisma.user.findFirst({ where: { id, organizationId: context.organizationId } });
    if (!user) throw new NotFoundException('Usuário não encontrado na organização atual');
    if (user.role === dto.role) throw new ForbiddenException('Esta já é a função principal do usuário');
    return this.prisma.userRoleAssignment.upsert({
      where: { userId_role: { userId: id, role: dto.role } },
      create: { userId: id, role: dto.role, grantedByUserId: context.userId },
      update: {},
      select: { id: true, role: true, createdAt: true },
    });
  }

  async removeAdditionalRole(id: string, role: UserRole, context: OrganizationContext) {
    await this.assertAdministrator(context);
    const user = await this.prisma.user.findFirst({ where: { id, organizationId: context.organizationId } });
    if (!user) throw new NotFoundException('Usuário não encontrado na organização atual');
    const result = await this.prisma.userRoleAssignment.deleteMany({ where: { userId: id, role } });
    if (!result.count) throw new NotFoundException('Função adicional não encontrada para este usuário');
    return { removed: true };
  }

  private async assertAdministrator(context: OrganizationContext) {
    const administrator = await this.prisma.user.findFirst({ where: { id: context.userId, organizationId: context.organizationId, ...userRoleWhere([UserRole.ADMIN, UserRole.SUPER_ADMIN]) } });
    if (!administrator) throw new ForbiddenException('Somente administradores podem gerenciar funções');
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

  private async generateAvailableLogin(nome: string, dominio: string) {
    const normalized = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const parts = normalized.split(/\s+/).filter(Boolean);
    const prefix = `${parts[0]}.${parts[parts.length - 1]}`;
    let suffix = 1;
    let loginEmail = `${prefix}@${dominio}`;
    while (await this.prisma.user.findUnique({ where: { loginEmail }, select: { id: true } })) {
      suffix += 1;
      loginEmail = `${prefix}${suffix}@${dominio}`;
    }
    return loginEmail;
  }

}
