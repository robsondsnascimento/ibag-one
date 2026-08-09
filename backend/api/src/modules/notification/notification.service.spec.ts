import { ForbiddenException } from '@nestjs/common';
import { NotificationAudience } from '../../generated/prisma/client';
import { NotificationService } from './notification.service';

describe('NotificationService pastoral campus scope', () => {
  const context = { userId: 'user-1', personId: 'person-1', organizationId: 'org-1' };
  const prisma = {
    user: { findFirst: jest.fn() },
    campus: { findFirst: jest.fn() },
    person: { findFirst: jest.fn(), findMany: jest.fn() },
    serviceArea: { findFirst: jest.fn() },
    serviceTeam: { findFirst: jest.fn() },
    event: { findFirst: jest.fn() },
    notification: { create: jest.fn() },
  };
  let service: NotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationService(prisma as never);
  });

  it('does not let a pastor bypass the person campus with an optional campusId', async () => {
    prisma.campus.findFirst.mockResolvedValue({ id: 'campus-1' });
    prisma.person.findFirst.mockResolvedValue({ id: 'person-2', campusId: 'campus-2' });
    prisma.user.findFirst.mockResolvedValue({ role: 'PASTOR', person: { campusId: 'campus-1' }, additionalRoles: [] });

    await expect(service.create({
      titulo: 'Aviso',
      mensagem: 'Mensagem de teste',
      audience: NotificationAudience.PERSON,
      personId: 'person-2',
      campusId: 'campus-1',
    }, context)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
