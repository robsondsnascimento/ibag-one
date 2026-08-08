import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrganizationContext } from '../../common/context/organization-context';
import { CreateCellMeetingVisitorDto } from './dto/create-cell-meeting-visitor.dto';
@Injectable()
export class CellMeetingVisitorService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateCellMeetingVisitorDto, context: OrganizationContext) {
    const meeting = await this.prisma.cellMeeting.findFirst({ where: { id: dto.meetingId, cell: { organizationId: context.organizationId } }, include: { cell: true } });
    if (!meeting) throw new NotFoundException('Encontro de célula não encontrado na organização atual');
    return this.prisma.$transaction(async (tx) => {
      const visitor = await tx.cellMeetingVisitor.create({ data: dto });
      await tx.cellMeeting.update({
        where: { id: dto.meetingId },
        data: { visitantes: { increment: 1 } },
      });
      const visits = await tx.cellMeetingVisitor.count({ where: { telefone: dto.telefone, meeting: { cellId: meeting.cellId } } });
      return { visitor, membershipSuggestion: { eligible: visits >= 3, visits, cellId: meeting.cellId } };
    });
  }
  async findByMeeting(meetingId: string, context: OrganizationContext) {
    const meeting = await this.prisma.cellMeeting.findFirst({ where: { id: meetingId, cell: { organizationId: context.organizationId } } });
    if (!meeting) throw new NotFoundException('Encontro de célula não encontrado na organização atual');
    return this.prisma.cellMeetingVisitor.findMany({ where: { meetingId }, orderBy: { nome: 'asc' } });
  }
  async remove(id: string, context: OrganizationContext) {
    const visitor = await this.prisma.cellMeetingVisitor.findFirst({ where: { id, meeting: { cell: { organizationId: context.organizationId } } } });
    if (!visitor) throw new NotFoundException('Visitante não encontrado na organização atual');
    return this.prisma.$transaction(async (tx) => {
      await tx.cellMeetingVisitor.delete({ where: { id } });
      await tx.cellMeeting.update({ where: { id: visitor.meetingId }, data: { visitantes: { decrement: 1 } } });
      return { id };
    });
  }
  async convertToPerson(id: string, context: OrganizationContext) {
    const visitor = await this.prisma.cellMeetingVisitor.findFirst({ where: { id, meeting: { cell: { organizationId: context.organizationId } } }, include: { meeting: { include: { cell: true } } } });
    if (!visitor) throw new NotFoundException('Visitante não encontrado na organização atual');
    if (visitor.personId) return this.prisma.person.findUnique({ where: { id: visitor.personId } });
    const existing = visitor.email ? await this.prisma.person.findFirst({ where: { email: visitor.email, organizationId: context.organizationId } }) : null;
    const person = existing ?? await this.prisma.person.create({ data: { nome: visitor.nome, telefone: visitor.telefone, email: visitor.email, campusId: visitor.meeting.cell.campusId, organizationId: context.organizationId } });
    await this.prisma.cellMeetingVisitor.update({ where: { id }, data: { personId: person.id } });
    return person;
  }
  async convertToMember(id: string, context: OrganizationContext) {
    const visitor = await this.prisma.cellMeetingVisitor.findFirst({ where: { id, meeting: { cell: { organizationId: context.organizationId } } }, include: { meeting: { include: { cell: true } } } });
    if (!visitor) throw new NotFoundException('Visitante não encontrado na organização atual');
    const visits = await this.prisma.cellMeetingVisitor.count({ where: { telefone: visitor.telefone, meeting: { cellId: visitor.meeting.cellId } } });
    if (visits < 3) throw new NotFoundException('O visitante ainda não participou de três encontros desta célula');
    const person = visitor.personId ? await this.prisma.person.findUnique({ where: { id: visitor.personId } }) : await this.prisma.person.findFirst({ where: { telefone: visitor.telefone, organizationId: context.organizationId } }) ?? await this.prisma.person.create({ data: { nome: visitor.nome, telefone: visitor.telefone, email: visitor.email, campusId: visitor.meeting.cell.campusId, organizationId: context.organizationId } });
    const membership = await this.prisma.cellMembership.findFirst({ where: { personId: person!.id, ativo: true } });
    if (membership) return { person, membership, created: false, requiresTransfer: membership.cellId !== visitor.meeting.cellId };
    const createdMembership = await this.prisma.cellMembership.create({ data: { personId: person!.id, cellId: visitor.meeting.cellId, ativo: true, inicio: new Date() } });
    await this.prisma.cellMeetingVisitor.update({ where: { id }, data: { personId: person!.id } });
    return { person, membership: createdMembership, created: true };
  }
}
