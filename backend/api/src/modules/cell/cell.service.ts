import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { CreateCellDto } from './dto/create-cell.dto';
import { UpdateCellDto } from './dto/update-cell.dto';

import {
  OrganizationContext,
} from '../../common/context/organization-context';
import { CellStatus } from '../../generated/prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { paginatedResult } from '../../common/pagination/paginated-result';
import { userRoleWhere } from '../../common/access/user-role.util';


@Injectable()
export class CellService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}


  async create(
    createCellDto: CreateCellDto,
    context: OrganizationContext,
  ) {

    await this.assertDirectoryManager(context);

    const campus =
      await this.prisma.campus.findFirst({
        where: {
          id: createCellDto.campusId,
          organizationId: context.organizationId,
        },
      });


    if (!campus) {

      throw new BadRequestException(
        'Campus não pertence à organização atual',
      );

    }


    return this.prisma.cell.create({

      data: {

        nome:
          createCellDto.nome,

        descricao:
          createCellDto.descricao,

        ativo:
          createCellDto.ativo ?? true,

        campusId:
          createCellDto.campusId,

        meetingDay:
          createCellDto.meetingDay,

        meetingTime:
          createCellDto.meetingTime,

        organizationId:
          context.organizationId,

      },

    });

  }


  async findAll(
    context: OrganizationContext,
    pagination: PaginationQueryDto,
  ) {

    await this.assertDirectoryManager(context);

    const where = {
      organizationId: context.organizationId,
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.cell.findMany({

      where,

      include: {

        campus: true,

        motherCell: {
          select: {
            id: true,
            nome: true,
          },
        },

      },

      orderBy: {

        nome: 'asc',

      },

      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,

      }),
      this.prisma.cell.count({ where }),
    ]);

    return paginatedResult(data, total, pagination);

  }


  async findOne(
    id: string,
    context: OrganizationContext,
  ) {

    await this.assertDirectoryManager(context);

    const cell =
      await this.prisma.cell.findFirst({

        where: {

          id,

          organizationId:
            context.organizationId,

        },

        include: {

          campus: true,

          network: {
            select: {
              id: true,
              nome: true,
            },
          },

          motherCell: {
            select: {
              id: true,
              nome: true,
            },
          },

        },

      });


    if (!cell) {

      throw new NotFoundException(
        'Célula não encontrada na organização atual',
      );

    }


    return cell;

  }

  async findOverview(
    id: string,
    context: OrganizationContext,
  ) {

    const cell = await this.findOne(id, context);

    const currentWeekMeetingAvailable = await this.ensureCurrentWeekMeeting(cell);

    const [leaderships, supportRoles, memberships, meetings, multiplications, coordinations, supervisions] =
      await this.prisma.$transaction([
        this.prisma.cellLeadership.findMany({
          where: { cellId: id, ativo: true },
          include: {
            person: {
              select: {
                id: true,
                nome: true,
                telefone: true,
                email: true,
              },
            },
          },
          orderBy: { inicio: 'asc' },
        }),
        this.prisma.cellSupportRole.findMany({
          where: { cellId: id, ativo: true },
          include: {
            person: {
              select: {
                id: true,
                nome: true,
                telefone: true,
                email: true,
              },
            },
          },
          orderBy: { inicio: 'asc' },
        }),
        this.prisma.cellMembership.findMany({
          where: { cellId: id, ativo: true },
          include: {
            person: {
              select: {
                id: true,
                nome: true,
                telefone: true,
                email: true,
              },
            },
          },
          orderBy: { person: { nome: 'asc' } },
        }),
        this.prisma.cellMeeting.findMany({
          where: { cellId: id },
          include: {
            _count: {
              select: {
                attendances: true,
                visitors: true,
              },
            },
          },
          orderBy: { data: 'desc' },
          take: 12,
        }),
        this.prisma.cellMultiplication.findMany({
          where: { sourceCellId: id },
          include: {
            newCell: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
          orderBy: { data: 'desc' },
        }),
        this.prisma.cellCampusCoordination.findMany({
          where: { campusId: cell.campusId, ativo: true },
          include: {
            person: {
              select: {
                id: true,
                nome: true,
                telefone: true,
                email: true,
              },
            },
          },
          orderBy: { inicio: 'asc' },
        }),
        this.prisma.cellNetworkSupervision.findMany({
          where: { networkId: cell.networkId ?? '', ativo: true },
          include: {
            person: {
              select: {
                id: true,
                nome: true,
                telefone: true,
                email: true,
              },
            },
          },
          orderBy: { inicio: 'asc' },
        }),
      ]);

    return {
      cell,
      leaderships,
      supportRoles,
      memberships,
      meetings,
      multiplications,
      coordinations,
      supervisions,
      summary: {
        activeMembers: memberships.length,
        activeLeaderships: leaderships.length,
        multiplicationCount: multiplications.length,
        lastMultiplicationAt: multiplications[0]?.data ?? null,
        currentWeekMeetingAvailable,
        meetingScheduleConfigured: Boolean(cell.meetingDay && cell.meetingTime),
      },
    };

  }


  async update(
    id: string,
    updateCellDto: UpdateCellDto,
    context: OrganizationContext,
  ) {

    await this.assertDirectoryManager(context);

    const cell =
      await this.prisma.cell.findFirst({

        where: {

          id,

          organizationId:
            context.organizationId,

        },

      });


    if (!cell) {

      throw new NotFoundException(
        'Célula não encontrada na organização atual',
      );

    }


    if (updateCellDto.campusId) {

      const campus =
        await this.prisma.campus.findFirst({

          where: {

            id: updateCellDto.campusId,

            organizationId:
              context.organizationId,

          },

        });


      if (!campus) {

        throw new BadRequestException(
          'Campus não pertence à organização atual',
        );

      }

    }


    return this.prisma.cell.update({

      where: {

        id,

      },

      data: updateCellDto,

      include: {

        campus: true,

      },

    });

  }


  async remove(
    id: string,
    context: OrganizationContext,
  ) {

    await this.assertDirectoryManager(context);

    const cell =
      await this.prisma.cell.findFirst({

        where: {

          id,

          organizationId:
            context.organizationId,

        },

      });


    if (!cell) {

      throw new NotFoundException(
        'Célula não encontrada na organização atual',
      );

    }


    return this.prisma.cell.update({

      where: {

        id,

      },

      data: {

        ativo: false,

      },

    });

  }

  async updateStatus(id: string, status: CellStatus, context: OrganizationContext) {
    await this.assertDirectoryManager(context);
    await this.findOne(id, context);
    return this.prisma.cell.update({ where: { id }, data: { status, ativo: ['ACTIVE', 'PLANNING'].includes(status) } });
  }

  private async assertDirectoryManager(context: OrganizationContext) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: context.userId,
        organizationId: context.organizationId,
        ...userRoleWhere(['SECRETARY', 'ADMIN', 'SUPER_ADMIN']),
      },
    });

    if (!user) {
      throw new ForbiddenException(
        'Somente administradores e secretários podem gerenciar cadastros de células',
      );
    }
  }

  private async ensureCurrentWeekMeeting(cell: {
    id: string;
    ativo: boolean;
    status: CellStatus;
    meetingDay: string | null;
    meetingTime: string | null;
  }): Promise<boolean> {
    if (!cell.ativo || cell.status !== CellStatus.ACTIVE || !cell.meetingDay || !cell.meetingTime) {
      return false;
    }

    const meetingDate = this.scheduledDateInCurrentWeek(cell.meetingDay, cell.meetingTime);
    const weekStart = new Date(meetingDate);
    const weekDay = weekStart.getDay() || 7;
    weekStart.setDate(weekStart.getDate() - weekDay + 1);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const existing = await this.prisma.cellMeeting.findFirst({
      where: {
        cellId: cell.id,
        data: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
    });

    if (existing) {
      return true;
    }

    await this.prisma.cellMeeting.create({
      data: {
        cellId: cell.id,
        data: meetingDate,
        tema: 'Encontro semanal',
        visitantes: 0,
      },
    });

    return true;
  }

  private scheduledDateInCurrentWeek(meetingDay: string, meetingTime: string) {
    const days: Record<string, number> = {
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
      SUNDAY: 7,
    };
    const result = new Date();
    const currentDay = result.getDay() || 7;
    result.setDate(result.getDate() + (days[meetingDay] - currentDay));
    const [hour, minute] = meetingTime.split(':').map(Number);
    result.setHours(hour, minute, 0, 0);
    return result;
  }

}
