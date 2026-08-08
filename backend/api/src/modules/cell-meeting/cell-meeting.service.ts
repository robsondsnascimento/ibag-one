import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { OrganizationContext } from '../../common/context/organization-context';
import { CreateCellMeetingDto } from './dto/create-cell-meeting.dto';

@Injectable()
export class CellMeetingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCellMeetingDto, context: OrganizationContext) {
    const cell = await this.prisma.cell.findFirst({
      where: {
        id: dto.cellId,
        organizationId: context.organizationId,
        ativo: true,
      },
    });

    if (!cell) {
      throw new NotFoundException(
        'Célula ativa não encontrada na organização atual',
      );
    }

    return this.prisma.cellMeeting.create({
      data: {
        cellId: dto.cellId,
        data: new Date(dto.data),
        tema: dto.tema,
        observacoes: dto.observacoes,
        visitantes: dto.visitantes ?? 0,
      },
      include: {
        cell: {
          include: {
            campus: true,
            network: true,
          },
        },
      },
    });
  }

  async findAll(context: OrganizationContext) {
    return this.prisma.cellMeeting.findMany({
      where: {
        cell: {
          organizationId: context.organizationId,
        },
      },
      include: {
        cell: {
          include: {
            campus: true,
            network: true,
          },
        },
      },
      orderBy: {
        data: 'desc',
      },
    });
  }

  async findOne(id: string, context: OrganizationContext) {
    const meeting = await this.prisma.cellMeeting.findFirst({
      where: {
        id,
        cell: {
          organizationId: context.organizationId,
        },
      },
      include: {
        cell: {
          include: {
            campus: true,
            network: true,
          },
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException(
        'Encontro de célula não encontrado na organização atual',
      );
    }

    return meeting;
  }

  async close(id: string, context: OrganizationContext) {
    const meeting = await this.prisma.cellMeeting.findFirst({ where: { id, cell: { organizationId: context.organizationId } } });
    if (!meeting) throw new NotFoundException('Encontro de célula não encontrado na organização atual');
    const memberCount = await this.prisma.cellMembership.count({ where: { cellId: meeting.cellId, ativo: true } });
    const attendanceCount = await this.prisma.cellMeetingAttendance.count({ where: { meetingId: id } });
    if (attendanceCount < memberCount) throw new BadRequestException('A chamada precisa ser preenchida para todos os membros ativos antes do fechamento');
    return this.prisma.cellMeeting.update({ where: { id }, data: { registroConcluidoEm: new Date() } });
  }
}
