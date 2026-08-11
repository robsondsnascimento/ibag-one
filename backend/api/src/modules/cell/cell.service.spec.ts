import { CellService } from './cell.service';
import { PrismaService } from '../../database/prisma.service';

describe('CellService', () => {
  const context = {
    userId: 'user-id',
    personId: 'person-id',
    organizationId: 'organization-id',
  };

  it('does not create a cell for a user without directory-management permission', async () => {
    const prisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      campus: {
        findFirst: jest.fn(),
      },
      cell: {
        create: jest.fn(),
      },
    };
    const service = new CellService(prisma as unknown as PrismaService);

    await expect(
      service.create(
        {
          nome: 'Célula Esperança',
          campusId: 'campus-id',
        },
        context,
      ),
    ).rejects.toThrow('Somente administradores e secretários podem gerenciar cadastros de células');

    expect(prisma.campus.findFirst).not.toHaveBeenCalled();
    expect(prisma.cell.create).not.toHaveBeenCalled();
  });

  it('does not expose a cell registration to a user without permission', async () => {
    const prisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      cell: {
        findFirst: jest.fn(),
      },
    };
    const service = new CellService(prisma as unknown as PrismaService);

    await expect(service.findOne('cell-id', context)).rejects.toThrow(
      'Somente administradores e secretários podem gerenciar cadastros de células',
    );

    expect(prisma.cell.findFirst).not.toHaveBeenCalled();
  });

  it('allows a directory manager to create a cell', async () => {
    const prisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue({ id: 'user-id' }),
      },
      campus: {
        findFirst: jest.fn().mockResolvedValue({ id: 'campus-id' }),
      },
      cell: {
        create: jest.fn().mockResolvedValue({ id: 'cell-id' }),
      },
    };
    const service = new CellService(prisma as unknown as PrismaService);

    await service.create(
      {
        nome: 'Célula Esperança',
        campusId: 'campus-id',
      },
      context,
    );

    expect(prisma.cell.create).toHaveBeenCalled();
  });

  it('returns an operational overview only for an authorized user', async () => {
    const prisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue({ id: 'user-id' }),
      },
      cell: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'cell-id',
          nome: 'Célula Esperança',
          campusId: 'campus-id',
          networkId: 'network-id',
          campus: { id: 'campus-id', nome: 'Campus' },
          network: { id: 'network-id', nome: 'Rede' },
          motherCell: null,
        }),
      },
      cellLeadership: {
        findMany: jest.fn().mockResolvedValue([{ id: 'leadership-id' }]),
      },
      cellSupportRole: {
        findMany: jest.fn().mockResolvedValue([{ id: 'support-role-id' }]),
      },
      cellMembership: {
        findMany: jest.fn().mockResolvedValue([{ id: 'membership-id' }, { id: 'membership-id-2' }]),
      },
      cellMeeting: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      cellMultiplication: {
        findMany: jest.fn().mockResolvedValue([{ id: 'multiplication-id', data: new Date('2026-01-12') }]),
      },
      cellCampusCoordination: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      cellNetworkSupervision: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn().mockImplementation((queries: Promise<unknown>[]) => Promise.all(queries)),
    };
    const service = new CellService(prisma as unknown as PrismaService);

    const overview = await service.findOverview('cell-id', context);

    expect(overview.cell.nome).toBe('Célula Esperança');
    expect(overview.summary).toEqual({
      activeMembers: 2,
      activeLeaderships: 1,
      multiplicationCount: 1,
      lastMultiplicationAt: new Date('2026-01-12'),
      currentWeekMeetingAvailable: false,
      meetingScheduleConfigured: false,
    });
    expect(prisma.cellLeadership.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { cellId: 'cell-id', ativo: true } }),
    );
  });

  it('generates the weekly meeting automatically for a scheduled active cell', async () => {
    const prisma = {
      cellMeeting: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'meeting-id' }),
      },
    };
    const service = new CellService(prisma as unknown as PrismaService);

    const available = await (service as any).ensureCurrentWeekMeeting({
      id: 'cell-id',
      ativo: true,
      status: 'ACTIVE',
      meetingDay: 'WEDNESDAY',
      meetingTime: '20:00',
    });

    expect(available).toBe(true);
    expect(prisma.cellMeeting.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          cellId: 'cell-id',
          tema: 'Encontro semanal',
        }),
      }),
    );
  });
});
