import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { OrganizationContext } from '../../common/context/organization-context';
import { CreateCellMeetingVisitorDto } from './dto/create-cell-meeting-visitor.dto';

@Injectable()
export class CellMeetingVisitorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCellMeetingVisitorDto, context: OrganizationContext) {
    const meeting = await this.prisma.cellMeeting.findFirst({
      where: {
        id: dto.meetingId,
        cell: { organizationId: context.organizationId },
      },
      include: { cell: true },
    });

    if (!meeting) {
      throw new NotFoundException(
        'Encontro de célula não encontrado na organização atual',
      );
    }

    const telefone = this.normalizePhone(dto.telefone);

    if (telefone.length < 8) {
      throw new BadRequestException('Informe um telefone válido para o visitante');
    }

    return this.prisma.$transaction(async (tx) => {
      const existingVisitor = await tx.cellMeetingVisitor.findFirst({
        where: { meetingId: dto.meetingId, telefone },
      });

      if (existingVisitor) {
        throw new ConflictException(
          'Este telefone já foi registrado como visitante neste encontro',
        );
      }

      const visitor = await tx.cellMeetingVisitor.create({
        data: { ...dto, telefone },
      });

      await tx.cellMeeting.update({
        where: { id: dto.meetingId },
        data: { visitantes: { increment: 1 } },
      });

      const visits = await tx.cellMeetingVisitor.count({
        where: {
          telefone,
          meeting: { cellId: meeting.cellId },
        },
      });

      return {
        visitor,
        membershipSuggestion: {
          eligible: visits >= 3,
          visits,
          cellId: meeting.cellId,
        },
      };
    });
  }

  async findByMeeting(meetingId: string, context: OrganizationContext) {
    const meeting = await this.prisma.cellMeeting.findFirst({
      where: {
        id: meetingId,
        cell: { organizationId: context.organizationId },
      },
    });

    if (!meeting) {
      throw new NotFoundException(
        'Encontro de célula não encontrado na organização atual',
      );
    }

    const visitors = await this.prisma.cellMeetingVisitor.findMany({
      where: { meetingId },
      orderBy: { nome: 'asc' },
    });

    return Promise.all(
      visitors.map(async (visitor) => {
        const telefone = visitor.telefone
          ? this.normalizePhone(visitor.telefone)
          : null;
        const visits = telefone
          ? await this.prisma.cellMeetingVisitor.count({
              where: { telefone, meeting: { cellId: meeting.cellId } },
            })
          : 0;

        return {
          ...visitor,
          visitCount: visits,
          eligibleForMembership: visits >= 3,
        };
      }),
    );
  }

  async remove(id: string, context: OrganizationContext) {
    const visitor = await this.prisma.cellMeetingVisitor.findFirst({
      where: {
        id,
        meeting: { cell: { organizationId: context.organizationId } },
      },
    });

    if (!visitor) {
      throw new NotFoundException('Visitante não encontrado na organização atual');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.cellMeetingVisitor.delete({ where: { id } });
      await tx.cellMeeting.update({
        where: { id: visitor.meetingId },
        data: { visitantes: { decrement: 1 } },
      });
      return { id };
    });
  }

  async convertToPerson(id: string, context: OrganizationContext) {
    const visitor = await this.findVisitorWithCell(id, context);

    if (visitor.personId) {
      const person = await this.prisma.person.findFirst({
        where: { id: visitor.personId, organizationId: context.organizationId },
      });

      if (person) return person;
    }

    const person = await this.findOrCreatePerson(visitor, context);
    await this.linkVisitorToPerson(id, person.id);

    return person;
  }

  async convertToMember(id: string, context: OrganizationContext) {
    const visitor = await this.findVisitorWithCell(id, context);
    const telefone = this.normalizePhone(visitor.telefone ?? '');
    const visits = await this.prisma.cellMeetingVisitor.count({
      where: { telefone, meeting: { cellId: visitor.meeting.cellId } },
    });

    if (visits < 3) {
      throw new BadRequestException(
        'O visitante ainda não participou de três encontros desta célula',
      );
    }

    const person = await this.findOrCreatePerson(visitor, context);
    const membership = await this.prisma.cellMembership.findFirst({
      where: { personId: person.id, ativo: true },
    });

    if (membership) {
      return {
        person,
        membership,
        created: false,
        requiresTransfer: membership.cellId !== visitor.meeting.cellId,
      };
    }

    return this.prisma.$transaction(async (tx) => {
      const createdMembership = await tx.cellMembership.create({
        data: {
          personId: person.id,
          cellId: visitor.meeting.cellId,
          ativo: true,
          inicio: new Date(),
        },
      });

      const participantStage = await tx.personJourneyEvent.findFirst({
        where: { personId: person.id, stage: 'CELL_PARTICIPANT' },
      });

      if (!participantStage) {
        await tx.personJourneyEvent.create({
          data: {
            personId: person.id,
            organizationId: context.organizationId,
            createdByUserId: context.userId,
            stage: 'CELL_PARTICIPANT',
            data: new Date(),
          },
        });
      }

      await this.linkVisitorToPerson(id, person.id, tx);

      return {
        person,
        membership: createdMembership,
        created: true,
        requiresTransfer: false,
      };
    });
  }

  private async findVisitorWithCell(id: string, context: OrganizationContext) {
    const visitor = await this.prisma.cellMeetingVisitor.findFirst({
      where: {
        id,
        meeting: { cell: { organizationId: context.organizationId } },
      },
      include: { meeting: { include: { cell: true } } },
    });

    if (!visitor) {
      throw new NotFoundException('Visitante não encontrado na organização atual');
    }

    return visitor;
  }

  private async findOrCreatePerson(
    visitor: Awaited<ReturnType<CellMeetingVisitorService['findVisitorWithCell']>>,
    context: OrganizationContext,
  ) {
    if (visitor.personId) {
      const linkedPerson = await this.prisma.person.findFirst({
        where: { id: visitor.personId, organizationId: context.organizationId },
      });

      if (linkedPerson) return linkedPerson;
    }

    const telefone = this.normalizePhone(visitor.telefone ?? '');
    const identities = [
      { telefone },
      ...(visitor.email ? [{ email: visitor.email }] : []),
    ];

    const existing = await this.prisma.person.findFirst({
      where: {
        organizationId: context.organizationId,
        OR: identities,
      },
    });

    if (existing) return existing;

    return this.prisma.person.create({
      data: {
        nome: visitor.nome,
        telefone,
        email: visitor.email,
        campusId: visitor.meeting.cell.campusId,
        organizationId: context.organizationId,
      },
    });
  }

  private async linkVisitorToPerson(
    visitorId: string,
    personId: string,
    database: Pick<PrismaService, 'cellMeetingVisitor'> = this.prisma,
  ) {
    const linkedVisitor = await database.cellMeetingVisitor.findFirst({
      where: { personId },
    });

    if (!linkedVisitor || linkedVisitor.id === visitorId) {
      await database.cellMeetingVisitor.update({
        where: { id: visitorId },
        data: { personId },
      });
    }
  }

  private normalizePhone(telefone: string) {
    return telefone.replace(/\D/g, '');
  }
}
