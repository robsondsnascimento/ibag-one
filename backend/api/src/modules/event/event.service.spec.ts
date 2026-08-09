import { ForbiddenException } from '@nestjs/common';
import { EventService } from './event.service';

describe('EventService pastoral campus scope', () => {
  const context = { userId: 'user-1', personId: 'person-1', organizationId: 'org-1' };
  const prisma = {
    user: { findFirst: jest.fn() },
    serviceMembership: { findFirst: jest.fn() },
  };
  let service: EventService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EventService(prisma as never);
  });

  it('does not pre-approve an event outside the pastor campus', async () => {
    prisma.user.findFirst.mockResolvedValue({ role: 'PASTOR', person: { campusId: 'campus-1' }, additionalRoles: [] });
    prisma.serviceMembership.findFirst.mockResolvedValue(null);

    await expect((service as any).canCreate({ campusId: 'campus-2' }, context)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows a pastor senior to operate an event in any campus', async () => {
    prisma.user.findFirst.mockResolvedValue({ role: 'PASTOR_SENIOR', person: { campusId: 'campus-1' }, additionalRoles: [] });

    await expect((service as any).canCreate({ campusId: 'campus-2' }, context)).resolves.toEqual({ central: true });
  });
});
