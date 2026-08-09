import { ServiceAreaService } from './service-area.service';

describe('ServiceAreaService', () => {
  const context = { userId: 'user-1', personId: 'person-1', organizationId: 'org-1' };

  it('atribui Ministro de Louvor apenas a integrante ativo da equipe', async () => {
    const prisma: any = {
      serviceTeam: { findFirst: jest.fn().mockResolvedValue({ id: 'team-1', serviceAreaId: 'area-music', campusId: 'campus-1' }) },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'SECRETARY' }) },
      serviceMembership: { findFirst: jest.fn().mockResolvedValue({ id: 'membership-1' }) },
      serviceOperationalRoleAssignment: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'role-1', role: 'WORSHIP_MINISTER' }),
      },
    };
    const service = new ServiceAreaService(prisma);

    await expect(service.assignOperationalRole('team-1', { personId: 'person-2', role: 'WORSHIP_MINISTER' }, context)).resolves.toEqual({ id: 'role-1', role: 'WORSHIP_MINISTER' });
    expect(prisma.serviceOperationalRoleAssignment.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        personId: 'person-2',
        teamId: 'team-1',
        serviceAreaId: 'area-music',
        role: 'WORSHIP_MINISTER',
      }),
    }));
  });

  it('impede criar escala quando a pessoa já possui outro compromisso ativo no mesmo horário', async () => {
    const prisma: any = {
      serviceTeam: { findFirst: jest.fn().mockResolvedValue({ id: 'team-1', serviceAreaId: 'area-1', campusId: 'campus-1' }) },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'SECRETARY' }) },
      serviceMembership: { findFirst: jest.fn().mockResolvedValue({ id: 'membership-1' }) },
      serviceSchedule: {
        findFirst: jest.fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ id: 'schedule-conflict' }),
      },
    };
    const service = new ServiceAreaService(prisma);

    await expect(service.createSchedule('team-1', {
      personId: 'person-2',
      data: '2026-08-16T22:30:00.000Z',
      funcao: 'Vocal',
    }, context)).rejects.toThrow('outra escala ativa neste mesmo horário');
  });

  it('permite criar um lote de escalas e notifica cada pessoa escalada', async () => {
    const created = (personId: string) => ({
      id: `schedule-${personId}`,
      personId,
      funcao: 'Vocal',
      data: new Date('2026-08-16T22:30:00.000Z'),
      teamId: 'team-1',
      team: { serviceAreaId: 'area-1', campusId: 'campus-1' },
      eventId: null,
      event: null,
      person: { id: personId, nome: personId },
    });
    const transaction = { serviceSchedule: { create: jest.fn().mockImplementation(({ data }) => Promise.resolve(created(data.personId))) } };
    const prisma: any = {
      serviceTeam: { findFirst: jest.fn().mockResolvedValue({ id: 'team-1', serviceAreaId: 'area-1', campusId: 'campus-1' }) },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'SECRETARY' }) },
      serviceMembership: { findFirst: jest.fn().mockResolvedValue({ id: 'membership-1' }) },
      serviceSchedule: { findFirst: jest.fn().mockResolvedValue(null) },
      $transaction: jest.fn(callback => callback(transaction)),
      notification: { create: jest.fn().mockResolvedValue({ id: 'notification-1' }) },
    };
    const service = new ServiceAreaService(prisma);

    await expect(service.createScheduleBatch('team-1', {
      schedules: [
        { personId: 'person-2', data: '2026-08-16T22:30:00.000Z', funcao: 'Vocal' },
        { personId: 'person-3', data: '2026-08-16T22:30:00.000Z', funcao: 'Guitarra' },
      ],
    }, context)).resolves.toHaveLength(2);
    expect(prisma.notification.create).toHaveBeenCalledTimes(2);
  });

  it('entrega à liderança geral a visão consolidada das escalas da própria área', async () => {
    const prisma: any = {
      serviceArea: { findFirst: jest.fn().mockResolvedValue({ id: 'area-1' }) },
      user: { findFirst: jest.fn().mockResolvedValue(null) },
      serviceMembership: {
        findMany: jest.fn().mockResolvedValue([{ role: 'GENERAL_LEADER', campusId: null, teamId: null }]),
      },
      serviceSchedule: { findMany: jest.fn().mockResolvedValue([{ id: 'schedule-1' }]) },
    };
    const service = new ServiceAreaService(prisma);

    await expect(service.findAreaSchedules('area-1', undefined, undefined, undefined, undefined, context)).resolves.toEqual([{ id: 'schedule-1' }]);
    expect(prisma.serviceSchedule.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ team: expect.objectContaining({ serviceAreaId: 'area-1' }) }),
    }));
  });

  it('permite que a própria pessoa recuse a escala e alerta a liderança da equipe', async () => {
    const schedule = {
      id: 'schedule-1', personId: 'person-1', teamId: 'team-1', eventId: 'event-1', status: 'SCHEDULED', funcao: 'Vocal', data: new Date('2026-08-16T22:30:00.000Z'),
      person: { id: 'person-1', nome: 'Pessoa Escalada' },
      team: { serviceAreaId: 'area-1', campusId: 'campus-1' },
      event: { id: 'event-1', titulo: 'Culto de Domingo' },
    };
    const prisma: any = {
      serviceSchedule: {
        findFirst: jest.fn().mockResolvedValue(schedule),
        update: jest.fn().mockResolvedValue({ ...schedule, status: 'DECLINED' }),
      },
      serviceMembership: { findMany: jest.fn().mockResolvedValue([{ personId: 'leader-1' }]) },
      notification: { create: jest.fn().mockResolvedValue({ id: 'notification-1' }) },
    };
    const service = new ServiceAreaService(prisma);

    await expect(service.updateScheduleStatus('schedule-1', { status: 'DECLINED' }, context)).resolves.toEqual(expect.objectContaining({ status: 'DECLINED' }));
    expect(prisma.serviceSchedule.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        status: 'DECLINED',
        history: { create: expect.objectContaining({ action: 'STATUS_CHANGED', previousStatus: 'SCHEDULED', newStatus: 'DECLINED' }) },
      }),
    }));
    expect(prisma.notification.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ titulo: 'Escala recusada', recipients: { create: [{ personId: 'leader-1' }] } }),
    }));
  });

  it('substitui a pessoa escalada, reinicia a confirmação e notifica as duas pessoas', async () => {
    const current = {
      id: 'schedule-1', personId: 'person-1', teamId: 'team-1', eventId: null, status: 'DECLINED', funcao: 'Vocal', data: new Date('2026-08-16T22:30:00.000Z'),
      person: { id: 'person-1', nome: 'Pessoa Anterior' },
      team: { serviceAreaId: 'area-1', campusId: 'campus-1' },
      event: null,
    };
    const updated = { ...current, personId: 'person-2', status: 'SCHEDULED', person: { id: 'person-2', nome: 'Nova Pessoa' } };
    const prisma: any = {
      serviceSchedule: {
        findFirst: jest.fn()
          .mockResolvedValueOnce(current)
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(null),
        update: jest.fn().mockResolvedValue(updated),
      },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'SECRETARY' }) },
      serviceMembership: { findFirst: jest.fn().mockResolvedValue({ id: 'membership-2', person: { nome: 'Nova Pessoa' } }) },
      notification: { create: jest.fn().mockResolvedValue({ id: 'notification-1' }) },
    };
    const service = new ServiceAreaService(prisma);

    await expect(service.substituteSchedule('schedule-1', { personId: 'person-2' }, context)).resolves.toEqual(expect.objectContaining({ personId: 'person-2', status: 'SCHEDULED' }));
    expect(prisma.serviceSchedule.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        personId: 'person-2',
        status: 'SCHEDULED',
        history: { create: expect.objectContaining({ action: 'SUBSTITUTED', previousPersonId: 'person-1', replacementPersonId: 'person-2' }) },
      }),
    }));
    expect(prisma.notification.create).toHaveBeenCalledTimes(2);
  });

  it('permite à pessoa escalada consultar o histórico da própria escala', async () => {
    const prisma: any = {
      serviceSchedule: { findFirst: jest.fn().mockResolvedValue({ id: 'schedule-1', personId: 'person-1', teamId: 'team-1', team: { serviceAreaId: 'area-1', campusId: 'campus-1' } }) },
      serviceScheduleHistory: { findMany: jest.fn().mockResolvedValue([{ action: 'CREATED' }, { action: 'STATUS_CHANGED' }]) },
    };
    const service = new ServiceAreaService(prisma);

    await expect(service.findScheduleHistory('schedule-1', context)).resolves.toEqual([{ action: 'CREATED' }, { action: 'STATUS_CHANGED' }]);
    expect(prisma.serviceScheduleHistory.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { scheduleId: 'schedule-1' } }));
  });
});
