import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { userRoleWhere } from '../../common/access/user-role.util';
import { OrganizationContext } from '../../common/context/organization-context';
import { PrismaService } from '../../database/prisma.service';
import { AddFamilyMemberDto } from './dto/add-family-member.dto';
import { CreateFamilyDto } from './dto/create-family.dto';

@Injectable()
export class FamilyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFamilyDto, context: OrganizationContext) {
    await this.authorize(context);
    return this.prisma.family.create({ data: { ...dto, organizationId: context.organizationId } });
  }

  async addMember(familyId: string, dto: AddFamilyMemberDto, context: OrganizationContext) {
    await this.authorize(context);
    const family = await this.prisma.family.findFirst({ where: { id: familyId, organizationId: context.organizationId, ativo: true } });
    const person = await this.prisma.person.findFirst({ where: { id: dto.personId, organizationId: context.organizationId } });
    if (!family || !person) throw new NotFoundException('Família ou pessoa não encontrada na organização atual');
    const active = await this.prisma.familyMembership.findFirst({ where: { personId: dto.personId, ativo: true } });
    if (active) throw new BadRequestException('A pessoa já possui vínculo familiar ativo');
    return this.prisma.familyMembership.create({ data: { familyId, ...dto, inicio: new Date(), ativo: true }, include: { person: true, family: true } });
  }

  async findOne(id: string, context: OrganizationContext) {
    await this.authorize(context);
    const family = await this.prisma.family.findFirst({ where: { id, organizationId: context.organizationId }, include: { members: { where: { ativo: true }, include: { person: true } } } });
    if (!family) throw new NotFoundException('Família não encontrada na organização atual');
    return family;
  }

  private async authorize(context: OrganizationContext) {
    const user = await this.prisma.user.findFirst({ where: { id: context.userId, organizationId: context.organizationId, ...userRoleWhere(['SECRETARY', 'PASTOR', 'ADMIN', 'SUPER_ADMIN']) } });
    if (!user) throw new ForbiddenException('Sem acesso a informações familiares');
  }
}
