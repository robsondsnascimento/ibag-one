import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrganizationContext } from '../../common/context/organization-context';
import { CreateCellMeetingAttendanceDto } from './dto/create-cell-meeting-attendance.dto';
import { SaveCellMeetingRosterDto } from './dto/save-cell-meeting-roster.dto';

@Injectable()
export class CellMeetingAttendanceService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateCellMeetingAttendanceDto, context: OrganizationContext) {
    const meeting = await this.prisma.cellMeeting.findFirst({ where: { id: dto.meetingId, cell: { organizationId: context.organizationId } } });
    if (!meeting) throw new NotFoundException('Encontro de célula não encontrado na organização atual');
    const person = await this.prisma.person.findFirst({ where: { id: dto.personId, organizationId: context.organizationId, ativo: true } });
    if (!person) throw new NotFoundException('Pessoa ativa não encontrada na organização atual');
    const membership = await this.prisma.cellMembership.findFirst({ where: { personId: dto.personId, cellId: meeting.cellId, ativo: true } });
    if (!membership) throw new BadRequestException('A pessoa não possui membresia ativa na célula deste encontro');
    const attendance = await this.prisma.cellMeetingAttendance.findUnique({ where: { meetingId_personId: { meetingId: dto.meetingId, personId: dto.personId } } });
    if (attendance) throw new BadRequestException('A presença desta pessoa já foi registrada para este encontro');
    return this.prisma.cellMeetingAttendance.create({ data: { meetingId: dto.meetingId, personId: dto.personId, presente: dto.presente ?? true, observacao: dto.observacao }, include: { person: true, meeting: true } });
  }
  async findByMeeting(meetingId: string, context: OrganizationContext) {
    const meeting = await this.prisma.cellMeeting.findFirst({ where: { id: meetingId, cell: { organizationId: context.organizationId } } });
    if (!meeting) throw new NotFoundException('Encontro de célula não encontrado na organização atual');
    return this.prisma.cellMeetingAttendance.findMany({ where: { meetingId }, include: { person: true }, orderBy: { person: { nome: 'asc' } } });
  }

  async findRoster(meetingId: string, context: OrganizationContext) {
    const meeting = await this.prisma.cellMeeting.findFirst({ where: { id: meetingId, cell: { organizationId: context.organizationId } } });
    if (!meeting) throw new NotFoundException('Encontro de célula não encontrado na organização atual');

    const memberships = await this.prisma.cellMembership.findMany({
      where: { cellId: meeting.cellId, ativo: true },
      include: { person: true },
      orderBy: { person: { nome: 'asc' } },
    });
    const attendances = await this.prisma.cellMeetingAttendance.findMany({ where: { meetingId } });
    const attendanceByPerson = new Map(attendances.map((attendance) => [attendance.personId, attendance]));

    return memberships.map((membership) => ({
      person: membership.person,
      attendance: attendanceByPerson.get(membership.personId) ?? null,
    }));
  }

  async saveRoster(meetingId: string, dto: SaveCellMeetingRosterDto, context: OrganizationContext) {
    const meeting = await this.prisma.cellMeeting.findFirst({ where: { id: meetingId, cell: { organizationId: context.organizationId } } });
    if (!meeting) throw new NotFoundException('Encontro de célula não encontrado na organização atual');
    const memberships = await this.prisma.cellMembership.findMany({ where: { cellId: meeting.cellId, ativo: true } });
    const memberIds = new Set(memberships.map((membership) => membership.personId));
    if (dto.attendances.some((attendance) => !memberIds.has(attendance.personId))) {
      throw new BadRequestException('A chamada contém uma pessoa sem membresia ativa nesta célula');
    }
    return this.prisma.$transaction(dto.attendances.map((attendance) => this.prisma.cellMeetingAttendance.upsert({
      where: { meetingId_personId: { meetingId, personId: attendance.personId } },
      create: { meetingId, personId: attendance.personId, presente: attendance.presente, observacao: attendance.observacao },
      update: { presente: attendance.presente, observacao: attendance.observacao },
    })));
  }
}
