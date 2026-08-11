import { BadRequestException, ConflictException } from '@nestjs/common';

import { CellMeetingVisitorService } from './cell-meeting-visitor.service';

describe('CellMeetingVisitorService', () => {
  const context = {
    userId: 'user-id',
    personId: 'authenticated-person-id',
    organizationId: 'organization-id',
  };

  const dto = {
    meetingId: 'meeting-id',
    nome: 'Visitante IBAG',
    telefone: '(51) 99999-0000',
  };

  const prisma = {
    $transaction: jest.fn(),
    cellMeeting: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    cellMeetingVisitor: {
      count: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    cellMembership: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    person: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    personJourneyEvent: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  let service: CellMeetingVisitorService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
    prisma.cellMeeting.findFirst.mockResolvedValue({
      id: dto.meetingId,
      cellId: 'cell-id',
      cell: { id: 'cell-id', campusId: 'campus-id' },
    });
    service = new CellMeetingVisitorService(prisma as never);
  });

  it('normalizes the phone and suggests membership on the third visit', async () => {
    prisma.cellMeetingVisitor.findFirst.mockResolvedValue(null);
    prisma.cellMeetingVisitor.create.mockResolvedValue({ id: 'visitor-id' });
    prisma.cellMeetingVisitor.count.mockResolvedValue(3);

    await expect(service.create(dto, context)).resolves.toEqual({
      visitor: { id: 'visitor-id' },
      membershipSuggestion: { eligible: true, visits: 3, cellId: 'cell-id' },
    });

    expect(prisma.cellMeetingVisitor.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ telefone: '51999990000' }),
    });
    expect(prisma.cellMeetingVisitor.count).toHaveBeenCalledWith({
      where: { telefone: '51999990000', meeting: { cellId: 'cell-id' } },
    });
  });

  it('does not allow the same phone to be added twice to one meeting', async () => {
    prisma.cellMeetingVisitor.findFirst.mockResolvedValue({ id: 'existing-visitor' });

    await expect(service.create(dto, context)).rejects.toBeInstanceOf(
      ConflictException,
    );

    expect(prisma.cellMeetingVisitor.create).not.toHaveBeenCalled();
  });

  it('creates a cell membership and a journey event after the third visit', async () => {
    prisma.cellMeetingVisitor.findFirst
      .mockResolvedValueOnce({
        id: 'visitor-id',
        telefone: '51999990000',
        email: null,
        nome: dto.nome,
        personId: null,
        meeting: { cellId: 'cell-id', cell: { campusId: 'campus-id' } },
      })
      .mockResolvedValueOnce(null);
    prisma.cellMeetingVisitor.count.mockResolvedValue(3);
    prisma.person.findFirst.mockResolvedValue({ id: 'person-id' });
    prisma.cellMembership.findFirst.mockResolvedValue(null);
    prisma.cellMembership.create.mockResolvedValue({ id: 'membership-id' });
    prisma.personJourneyEvent.findFirst.mockResolvedValue(null);

    await expect(service.convertToMember('visitor-id', context)).resolves.toEqual(
      expect.objectContaining({
        person: { id: 'person-id' },
        membership: { id: 'membership-id' },
        created: true,
        requiresTransfer: false,
      }),
    );

    expect(prisma.personJourneyEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        personId: 'person-id',
        organizationId: context.organizationId,
        createdByUserId: context.userId,
        stage: 'CELL_PARTICIPANT',
      }),
    });
  });

  it('does not convert a visitor before three visits', async () => {
    prisma.cellMeetingVisitor.findFirst.mockResolvedValue({
      id: 'visitor-id',
      telefone: '51999990000',
      meeting: { cellId: 'cell-id', cell: { campusId: 'campus-id' } },
    });
    prisma.cellMeetingVisitor.count.mockResolvedValue(2);

    await expect(
      service.convertToMember('visitor-id', context),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
