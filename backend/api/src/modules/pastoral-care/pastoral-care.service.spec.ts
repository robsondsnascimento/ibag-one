import { ForbiddenException } from '@nestjs/common';
import { PastoralCareService } from './pastoral-care.service';

describe('PastoralCareService', () => {
  const context = { userId: 'user-id', personId: 'authenticated-person-id', organizationId: 'organization-id' };
  const subject = { id: 'subject-person-id', campusId: 'campus-id' };
  const prisma = {
    person: { findFirst: jest.fn() },
    user: { findFirst: jest.fn() },
    cellMembership: { findFirst: jest.fn() },
    cellLeadership: { findFirst: jest.fn() },
    cell: { findUnique: jest.fn() },
    cellNetworkSupervision: { findFirst: jest.fn() },
    cellCampusCoordination: { findFirst: jest.fn() },
    pastoralCare: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
  };
  let service: PastoralCareService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PastoralCareService(prisma as never);
  });

  it('allows a pastor to view care for any person in their campus, even without a cell membership', async () => {
    prisma.person.findFirst.mockResolvedValue(subject);
    prisma.user.findFirst.mockResolvedValue({ role: 'PASTOR', person: { campusId: subject.campusId }, additionalRoles: [] });
    prisma.pastoralCare.findMany.mockResolvedValue([]);

    await expect(service.findForSubject(subject.id, context)).resolves.toEqual([]);
    expect(prisma.cellMembership.findFirst).not.toHaveBeenCalled();
  });

  it('allows a coordinator to view care only for people linked to cells in a coordinated campus', async () => {
    prisma.person.findFirst.mockResolvedValue(subject);
    prisma.user.findFirst.mockResolvedValue({ role: 'MEMBER', person: { campusId: 'another-campus-id' }, additionalRoles: [] });
    prisma.cellMembership.findFirst.mockResolvedValue({ cellId: 'cell-id' });
    prisma.cellLeadership.findFirst.mockResolvedValue(null);
    prisma.cell.findUnique.mockResolvedValue({ id: 'cell-id', campusId: subject.campusId, networkId: null });
    prisma.cellCampusCoordination.findFirst.mockResolvedValue({ id: 'coordination-id' });
    prisma.pastoralCare.findMany.mockResolvedValue([]);

    await expect(service.findForSubject(subject.id, context)).resolves.toEqual([]);
  });

  it('does not allow a coordinator to access a person who is not linked to a cell', async () => {
    prisma.person.findFirst.mockResolvedValue(subject);
    prisma.user.findFirst.mockResolvedValue({ role: 'MEMBER', person: { campusId: subject.campusId }, additionalRoles: [] });
    prisma.cellMembership.findFirst.mockResolvedValue(null);

    await expect(service.findForSubject(subject.id, context)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
