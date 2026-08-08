import { NotFoundException } from '@nestjs/common';

import { CellMeetingService } from './cell-meeting.service';

describe('CellMeetingService', () => {
  const context = {
    userId: 'user-id',
    personId: 'person-id',
    organizationId: 'organization-id',
  };
  const dto = {
    cellId: 'cell-id',
    data: '2026-08-08T19:30:00.000Z',
    visitantes: 2,
  };
  const prisma = {
    cell: { findFirst: jest.fn() },
    cellMeeting: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  };
  let service: CellMeetingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CellMeetingService(prisma as never);
  });

  it('rejects a cell outside the current organization', async () => {
    prisma.cell.findFirst.mockResolvedValue(null);

    await expect(service.create(dto, context))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates a meeting for an active cell in the organization', async () => {
    const meeting = { id: 'meeting-id' };
    prisma.cell.findFirst.mockResolvedValue({ id: dto.cellId });
    prisma.cellMeeting.create.mockResolvedValue(meeting);

    await expect(service.create(dto, context)).resolves.toEqual(meeting);
    expect(prisma.cellMeeting.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          cellId: dto.cellId,
          visitantes: 2,
        }),
      }),
    );
  });
});
