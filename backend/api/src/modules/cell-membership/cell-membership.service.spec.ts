import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { CellMembershipService } from './cell-membership.service';


describe('CellMembershipService', () => {

  const context = {
    userId: 'user-id',
    personId: 'authenticated-person-id',
    organizationId: 'organization-id',
  };

  const dto = {
    personId: 'person-id',
    cellId: 'new-cell-id',
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
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    cellLeadership: {
      findFirst: jest.fn(),
    },
    cellSupportRole: {
      findFirst: jest.fn(),
    },
  };

  let service: CellMembershipService;


  beforeEach(() => {
    jest.clearAllMocks();

    prisma.user.findFirst.mockResolvedValue({ id: context.userId });

    service = new CellMembershipService(prisma as never);
  });


  it('rejects a person outside the current organization', async () => {
    prisma.person.findFirst.mockResolvedValue(null);

    await expect(service.create(dto, context))
      .rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.person.findFirst).toHaveBeenCalledWith({
      where: {
        id: dto.personId,
        organizationId: context.organizationId,
      },
    });
  });


  it('requires confirmation before transferring a member from another cell', async () => {
    prisma.person.findFirst.mockResolvedValue({ id: dto.personId });
    prisma.cell.findFirst.mockResolvedValue({ id: dto.cellId });
    prisma.cellMembership.findFirst.mockResolvedValue({
      id: 'current-membership-id',
      cellId: 'current-cell-id',
    });

    await expect(service.create(dto, context))
      .rejects.toBeInstanceOf(ConflictException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });


  it('ends the current membership and creates the new one after confirmation', async () => {
    const newMembership = { id: 'new-membership-id' };

    prisma.person.findFirst.mockResolvedValue({ id: dto.personId });
    prisma.cell.findFirst.mockResolvedValue({ id: dto.cellId });
    prisma.cellMembership.findFirst.mockResolvedValue({
      id: 'current-membership-id',
      cellId: 'current-cell-id',
    });
    prisma.cellMembership.create.mockResolvedValue(newMembership);
    prisma.$transaction.mockImplementation(async (callback) => callback(prisma));

    await expect(
      service.create({ ...dto, confirmTransfer: true }, context),
    ).resolves.toEqual(newMembership);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.cellMembership.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'current-membership-id',
        },
        data: expect.objectContaining({
          ativo: false,
        }),
      }),
    );
    expect(prisma.cellMembership.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          personId: dto.personId,
          cellId: dto.cellId,
          ativo: true,
        }),
      }),
    );
  });

  it('does not remove a member while the person has an active role in the cell', async () => {
    prisma.cellMembership.findFirst.mockResolvedValue({
      id: 'membership-id',
      personId: dto.personId,
      cellId: dto.cellId,
    });
    prisma.cellLeadership.findFirst.mockResolvedValue({ id: 'leadership-id' });
    prisma.cellSupportRole.findFirst.mockResolvedValue(null);

    await expect(service.end('membership-id', context)).rejects.toBeInstanceOf(ConflictException);

    expect(prisma.cellMembership.update).not.toHaveBeenCalled();
  });

  it('ends a member with no active role in the cell', async () => {
    prisma.cellMembership.findFirst.mockResolvedValue({
      id: 'membership-id',
      personId: dto.personId,
      cellId: dto.cellId,
    });
    prisma.cellLeadership.findFirst.mockResolvedValue(null);
    prisma.cellSupportRole.findFirst.mockResolvedValue(null);
    prisma.cellMembership.update.mockResolvedValue({ id: 'membership-id', ativo: false });

    await expect(service.end('membership-id', context)).resolves.toEqual({
      id: 'membership-id',
      ativo: false,
    });

    expect(prisma.cellMembership.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'membership-id' },
        data: expect.objectContaining({ ativo: false }),
      }),
    );
  });

});
