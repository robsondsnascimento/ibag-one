import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { hasAnyUserRole } from '../../common/access/user-role.util';
import { OrganizationContext } from '../../common/context/organization-context';
import { PrismaService } from '../../database/prisma.service';
import { AddFamilyMemberDto } from './dto/add-family-member.dto';
import { CreateFamilyDto } from './dto/create-family.dto';

@Injectable()
export class FamilyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFamilyDto, context: OrganizationContext) {
    await this.accessibleCampusId(context);
    return this.prisma.family.create({ data: { ...dto, organizationId: context.organizationId } });
  }

  async addMember(familyId: string, dto: AddFamilyMemberDto, context: OrganizationContext) {
    const campusId = await this.accessibleCampusId(context);
    const family = await this.prisma.family.findFirst({ where: { id: familyId, organizationId: context.organizationId, ativo: true } });
    const person = await this.prisma.person.findFirst({ where: { id: dto.personId, organizationId: context.organizationId } });
    if (!family || !person) throw new NotFoundException('Família ou pessoa não encontrada na organização atual');
    if (campusId && person.campusId !== campusId) throw new ForbiddenException('O pastor só pode vincular pessoas do seu campus');
    const active = await this.prisma.familyMembership.findFirst({ where: { personId: dto.personId, ativo: true } });
    if (active) throw new BadRequestException('A pessoa já possui vínculo familiar ativo');
    return this.prisma.familyMembership.create({ data: { familyId, ...dto, inicio: new Date(), ativo: true }, include: { person: true, family: true } });
  }

  async findOne(id: string, context: OrganizationContext) {
    const campusId = await this.accessibleCampusId(context);
    const family = await this.prisma.family.findFirst({ where: { id, organizationId: context.organizationId }, include: { members: { where: { ativo: true, ...(campusId ? { person: { campusId } } : {}) }, include: { person: true } } } });
    if (!family) throw new NotFoundException('Família não encontrada na organização atual');
    if (campusId && !family.members.length) throw new NotFoundException('Família não encontrada no campus atual');
    return family;
  }

  private async accessibleCampusId(context: OrganizationContext): Promise<string | undefined> {
    const user = await this.prisma.user.findFirst({ where: { id: context.userId, organizationId: context.organizationId }, include: { person: { select: { campusId: true } }, additionalRoles: { select: { role: true } } } });
    if (hasAnyUserRole(user, ['SECRETARY', 'ADMIN', 'SUPER_ADMIN', 'PASTOR_SENIOR'])) return undefined;
    if (hasAnyUserRole(user, ['PASTOR'])) return user?.person.campusId;
    throw new ForbiddenException('Sem acesso a informações familiares');
  }
}
