import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrganizationContext } from '../../common/context/organization-context';
import { CreatePastoralCareDto } from './dto/create-pastoral-care.dto';
import { hasAnyUserRole } from '../../common/access/user-role.util';
@Injectable()
export class PastoralCareService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreatePastoralCareDto, context: OrganizationContext) {
    const subject = await this.person(dto.subjectPersonId, context.organizationId);
    await this.person(dto.responsiblePersonId, context.organizationId);
    await this.assertAccess(subject, context);
    return this.prisma.pastoralCare.create({ data: { ...dto, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined, organizationId: context.organizationId }, include: this.include() });
  }
  async findForSubject(personId: string, context: OrganizationContext) {
    const subject = await this.person(personId, context.organizationId);
    await this.assertAccess(subject, context);
    return this.prisma.pastoralCare.findMany({ where: { subjectPersonId: personId }, include: this.include(), orderBy: { createdAt: 'desc' } });
  }
  async complete(id: string, context: OrganizationContext) {
    const care = await this.prisma.pastoralCare.findFirst({ where: { id, organizationId: context.organizationId }, include: { subjectPerson: true } });
    if (!care) throw new NotFoundException('Acompanhamento pastoral não encontrado');
    if (care.responsiblePersonId !== context.personId) await this.assertAccess(care.subjectPerson, context);
    return this.prisma.pastoralCare.update({ where: { id }, data: { status: 'COMPLETED', concluidoEm: new Date() }, include: this.include() });
  }
  private async person(id: string, organizationId: string) { const person = await this.prisma.person.findFirst({ where: { id, organizationId } }); if (!person) throw new NotFoundException('Pessoa não encontrada na organização atual'); return person; }
  private async assertAccess(subject: any, context: OrganizationContext) {
    const user = await this.prisma.user.findFirst({ where: { id: context.userId, organizationId: context.organizationId }, include: { person: true, additionalRoles: { select: { role: true } } } });
    if (!user) throw new ForbiddenException('Usuário sem vínculo organizacional');
    if (hasAnyUserRole(user, ['ADMIN', 'SUPER_ADMIN'])) return;
    if (hasAnyUserRole(user, ['PASTOR']) && user.person.campusId === subject.campusId) return;
    const membership = await this.prisma.cellMembership.findFirst({ where: { personId: subject.id, ativo: true } });
    if (!membership) throw new ForbiddenException('Sem acesso a este acompanhamento');
    const leadership = await this.prisma.cellLeadership.findFirst({ where: { personId: context.personId, cellId: membership.cellId, ativo: true } });
    if (leadership) return;
    const cell = await this.prisma.cell.findUnique({ where: { id: membership.cellId } });
    if (cell?.networkId) { const supervision = await this.prisma.cellNetworkSupervision.findFirst({ where: { personId: context.personId, networkId: cell.networkId, ativo: true } }); if (supervision) return; }
    throw new ForbiddenException('Sem acesso a este acompanhamento');
  }
  private include() { return { subjectPerson: true, responsiblePerson: true }; }
}
