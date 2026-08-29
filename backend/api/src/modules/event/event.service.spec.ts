import { ForbiddenException } from '@nestjs/common';
import { EventRecurrence } from '../../generated/prisma/client';
import { EventService } from './event.service';

describe('EventService pastoral campus scope', () => {
  const context = { userId: 'user-1', personId: 'person-1', organizationId: 'org-1' };
  const prisma = {
    user: { findFirst: jest.fn() },
    serviceMembership: { findFirst: jest.fn() },
    cellLeadership: { findFirst: jest.fn() },
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

    await expect((service as any).canCreate({ campusId: 'campus-2' }, context)).resolves.toEqual({ autoApprove: true, canBlockAgenda: false });
  });

  it('permite ao líder ativo de célula solicitar o evento da própria célula', async () => {
    prisma.user.findFirst.mockResolvedValue({ role: 'MEMBER', person: { campusId: 'campus-1' }, additionalRoles: [] });
    prisma.cellLeadership.findFirst.mockResolvedValue({ id: 'leadership-1' });

    await expect((service as any).canCreate({ campusId: 'campus-1', cellId: 'cell-1' }, context)).resolves.toEqual({ autoApprove: false, canBlockAgenda: false });
  });

  it('permite acesso à agenda ao líder ativo de área ou célula', async () => {
    prisma.user.findFirst.mockResolvedValue({ role: 'MEMBER', person: { campusId: 'campus-1' }, additionalRoles: [] });
    prisma.serviceMembership.findFirst.mockResolvedValue(null);
    prisma.cellLeadership.findFirst.mockResolvedValue({ id: 'leadership-1' });

    await expect((service as any).assertAgendaAccess(context)).resolves.toBeUndefined();
  });
  it('shows on mobile only approved events from the person campuses', async () => {
    (prisma as any).event = { findMany: jest.fn().mockResolvedValue([{ id: 'event-1' }]) };
    prisma.user.findFirst.mockResolvedValue({
      role: 'MEMBER',
      person: {
        campusId: 'campus-1',
        campusMemberships: [{ campusId: 'campus-2' }],
      },
      additionalRoles: [],
    });

    await expect(service.findVisibleToMe(undefined, undefined, context)).resolves.toEqual([{ id: 'event-1' }]);

    expect((prisma as any).event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: 'org-1',
          campusId: { in: ['campus-1', 'campus-2'] },
          status: 'APPROVED',
        }),
      }),
    );
  });

  it('creates weekly occurrences through the requested final date', () => {
    const occurrences = (service as any).recurrenceOccurrences(
      new Date('2026-08-02T20:00:00.000Z'),
      new Date('2026-08-02T22:00:00.000Z'),
      EventRecurrence.WEEKLY,
      new Date('2026-08-16T23:59:59.000Z'),
    );

    expect(occurrences).toHaveLength(3);
    expect(occurrences.map((occurrence: { inicio: Date }) => occurrence.inicio.toISOString().slice(0, 10))).toEqual([
      '2026-08-02',
      '2026-08-09',
      '2026-08-16',
    ]);
  });

  it('keeps the final valid day when repeating monthly', () => {
    const occurrences = (service as any).recurrenceOccurrences(
      new Date('2026-01-31T12:00:00.000Z'),
      new Date('2026-01-31T14:00:00.000Z'),
      EventRecurrence.MONTHLY,
      new Date('2026-03-31T23:59:59.000Z'),
    );

    expect(occurrences.map((occurrence: { inicio: Date }) => occurrence.inicio.toISOString().slice(0, 10))).toEqual([
      '2026-01-31',
      '2026-02-28',
      '2026-03-31',
    ]);
  });

  it('applies the active default model to each compatible recurring worship event', async () => {
    (prisma as any).worshipOrderTemplate = {
      findFirst: jest.fn().mockResolvedValue({
        id: 'template-1',
        items: [
          { sequencia: 1, titulo: 'Celebração de início', horario: null, observacoes: null, serviceAreaId: 'music-area' },
          { sequencia: 2, titulo: 'Oração', horario: null, observacoes: null, serviceAreaId: null },
        ],
      }),
    };
    (prisma as any).worshipOrder = { create: jest.fn().mockResolvedValue({ id: 'order-1' }) };

    await (service as any).createDefaultOrderForRecurringWorship({
      id: 'event-1',
      type: 'WORSHIP',
      status: 'APPROVED',
      recurrenceSeriesId: 'series-1',
      organizationId: 'org-1',
      createdByUserId: 'user-1',
      serviceAreas: [{ serviceAreaId: 'music-area' }],
    });

    expect((prisma as any).worshipOrder.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        eventId: 'event-1',
        templateId: 'template-1',
        createdByUserId: 'user-1',
      }),
    });
  });
});
