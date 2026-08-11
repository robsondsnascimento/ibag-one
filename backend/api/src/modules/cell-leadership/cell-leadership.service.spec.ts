import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { CellLeadershipService } from './cell-leadership.service';


describe('CellLeadershipService', () => {

  const context = {
    userId: 'user-id',
    personId: 'authenticated-person-id',
    organizationId: 'organization-id',
  };

  const dto = {
    personId: 'person-id',
    cellId: 'cell-id',
  };

  const prisma = {
    $transaction: jest.fn(),
    user: {
      findFirst: jest.fn(),
    },
    person: {
      findFirst: jest.fn(),
    },
    cell: {
      findFirst: jest.fn(),
    },
    cellMembership: {
      findFirst: jest.fn(),
    },
    cellLeadership: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: CellLeadershipService;


  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findFirst.mockResolvedValue({ id: context.userId });

    service = new CellLeadershipService(prisma as never);
  });


  it('rejects a person outside the current organization', async () => {
    prisma.person.findFirst.mockResolvedValue(null);

    await expect(service.create(dto, context))
      .rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.person.findFirst).toHaveBeenCalledWith({
      where: {
        id: dto.personId,
        organizationId: context.organizationId,
        ativo: true,
      },
    });
  });


  it('requires an active membership in the selected cell', async () => {
    prisma.person.findFirst.mockResolvedValue({ id: dto.personId });
    prisma.cell.findFirst.mockResolvedValue({ id: dto.cellId });
    prisma.cellMembership.findFirst.mockResolvedValue(null);

    await expect(service.create(dto, context))
      .rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.cellMembership.findFirst).toHaveBeenCalledWith({
      where: {
        personId: dto.personId,
        cellId: dto.cellId,
        ativo: true,
      },
    });
  });


  it('rejects a duplicate active leadership for the same person and cell', async () => {
    prisma.person.findFirst.mockResolvedValue({ id: dto.personId });
    prisma.cell.findFirst.mockResolvedValue({ id: dto.cellId });
    prisma.cellMembership.findFirst.mockResolvedValue({ id: 'membership-id' });
    prisma.cellLeadership.findFirst.mockResolvedValue({ id: 'leadership-id' });

    await expect(service.create(dto, context))
      .rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.cellLeadership.create).not.toHaveBeenCalled();
  });


  it('creates an active leadership for an eligible member', async () => {
    const leadership = { id: 'leadership-id' };

    prisma.person.findFirst.mockResolvedValue({ id: dto.personId });
    prisma.cell.findFirst.mockResolvedValue({ id: dto.cellId });
    prisma.cellMembership.findFirst.mockResolvedValue({ id: 'membership-id' });
    prisma.cellLeadership.findFirst.mockResolvedValue(null);
    prisma.cellLeadership.create.mockResolvedValue(leadership);

    await expect(service.create(dto, context))
      .resolves.toEqual(leadership);

    expect(prisma.cellLeadership.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          personId: dto.personId,
          cellId: dto.cellId,
          ativo: true,
        }),
      }),
    );
  });


  it('ends only an active leadership from the current organization', async () => {
    const endedLeadership = { id: 'leadership-id', ativo: false };

    prisma.cellLeadership.findFirst.mockResolvedValue({
      id: 'leadership-id',
      personId: dto.personId,
      cellId: dto.cellId,
    });
    prisma.cellLeadership.update.mockResolvedValue(endedLeadership);

    await expect(service.end('leadership-id', context))
      .resolves.toEqual(endedLeadership);

    expect(prisma.cellLeadership.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'leadership-id',
        ativo: true,
        person: {
          organizationId: context.organizationId,
        },
        cell: {
          organizationId: context.organizationId,
        },
      },
    });
    expect(prisma.cellLeadership.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'leadership-id',
        },
        data: expect.objectContaining({
          ativo: false,
        }),
      }),
    );
  });


  it('transfers an active leadership atomically to an eligible cell', async () => {
    const transferredLeadership = { id: 'new-leadership-id' };

    prisma.cellLeadership.findFirst
      .mockResolvedValueOnce({
        id: 'leadership-id',
        personId: dto.personId,
        cellId: dto.cellId,
      })
      .mockResolvedValueOnce(null);
    prisma.cell.findFirst.mockResolvedValue({ id: 'new-cell-id' });
    prisma.cellMembership.findFirst.mockResolvedValue({ id: 'membership-id' });
    prisma.cellLeadership.create.mockResolvedValue(transferredLeadership);
    prisma.$transaction.mockImplementation(async (callback) => callback(prisma));

    await expect(
      service.transfer('leadership-id', 'new-cell-id', context),
    ).resolves.toEqual(transferredLeadership);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.cellLeadership.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'leadership-id',
        },
        data: expect.objectContaining({
          ativo: false,
        }),
      }),
    );
    expect(prisma.cellLeadership.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          personId: dto.personId,
          cellId: 'new-cell-id',
          ativo: true,
        }),
      }),
    );
  });

});
