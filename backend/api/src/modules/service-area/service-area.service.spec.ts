import { ServiceAreaService } from './service-area.service';

describe('ServiceAreaService', () => {
  const context = { userId: 'user-1', personId: 'person-1', organizationId: 'org-1' };

  it('inclui Pastores Sênior e Pastores ativos na visão hierárquica da área', async () => {
    const detail = { id: 'area-1', ativo: true, teams: [], memberships: [] };
    const prisma: any = {
      serviceArea: {
        findFirst: jest.fn().mockResolvedValue({ id: 'area-1', ativo: true }),
        findUnique: jest.fn().mockResolvedValue(detail),
      },
      user: {
        findMany: jest.fn().mockResolvedValue([
          { role: 'PASTOR_SENIOR', additionalRoles: [], person: { id: 'person-senior', nome: 'Pastor Sênior', campus: { id: 'campus-1', nome: 'Cachoeirinha' } } },
          { role: 'MEMBER', additionalRoles: [{ role: 'PASTOR' }], person: { id: 'person-pastor', nome: 'Pastor do Campus', campus: { id: 'campus-2', nome: 'Esteio' } } },
        ]),
      },
    };
    const service = new ServiceAreaService(prisma);

    await expect(service.findOne('area-1', context)).resolves.toEqual(expect.objectContaining({
      pastoralLeadership: [
        { role: 'PASTOR_SENIOR', person: { id: 'person-senior', nome: 'Pastor Sênior', campus: { id: 'campus-1', nome: 'Cachoeirinha' } } },
        { role: 'PASTOR', person: { id: 'person-pastor', nome: 'Pastor do Campus', campus: { id: 'campus-2', nome: 'Esteio' } } },
      ],
    }));
    expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ organizationId: 'org-1', ativo: true }),
    }));
  });

  it('inativa a área e todas as equipes ativas, sem apagar histórico', async () => {
    const updatedArea = { id: 'area-1', ativo: false };
    const prisma: any = {
      serviceArea: {
        findFirst: jest.fn().mockResolvedValue({ id: 'area-1', ativo: true }),
        update: jest.fn().mockResolvedValue(updatedArea),
      },
      serviceTeam: { updateMany: jest.fn().mockResolvedValue({ count: 2 }) },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'SECRETARY' }) },
      $transaction: jest.fn((operations) => Promise.all(operations)),
    };
    const service = new ServiceAreaService(prisma);

    await expect(service.update('area-1', { ativo: false }, context)).resolves.toEqual(updatedArea);
    expect(prisma.serviceArea.update).toHaveBeenCalledWith({ where: { id: 'area-1' }, data: { ativo: false } });
    expect(prisma.serviceTeam.updateMany).toHaveBeenCalledWith({
      where: { serviceAreaId: 'area-1', ativo: true },
      data: { ativo: false },
    });
  });

  it('impede reativar equipe enquanto sua área estiver inativa', async () => {
    const prisma: any = {
      serviceTeam: { findFirst: jest.fn().mockResolvedValue({ id: 'team-1', serviceAreaId: 'area-1' }), update: jest.fn() },
      serviceArea: { findFirst: jest.fn().mockResolvedValue({ id: 'area-1', ativo: false }) },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'SECRETARY' }) },
    };
    const service = new ServiceAreaService(prisma);

    await expect(service.updateTeam('team-1', { ativo: true }, context)).rejects.toThrow('Reative a área de serviço antes de reativar uma equipe');
    expect(prisma.serviceTeam.update).not.toHaveBeenCalled();
  });

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

  it('retorna a atribuição ativa de Ministro de Louvor junto à escala da pessoa', async () => {
    const prisma: any = { serviceSchedule: { findMany: jest.fn().mockResolvedValue([]) } };
    const service = new ServiceAreaService(prisma);

    await service.findMySchedules(undefined, undefined, context);

    expect(prisma.serviceSchedule.findMany).toHaveBeenCalledWith(expect.objectContaining({
      include: expect.objectContaining({
        person: {
          include: {
            serviceOperationalRoles: {
              where: { ativo: true, role: 'WORSHIP_MINISTER' },
              select: { role: true, teamId: true },
            },
            serviceMemberships: {
              where: { ativo: true },
              select: { teamId: true, funcoes: true },
            },
          },
        },
      }),
    }));
  });

  it('impede criar escala quando a pessoa já possui outro compromisso ativo no mesmo horário', async () => {
    const prisma: any = {
      serviceTeam: { findFirst: jest.fn().mockResolvedValue({ id: 'team-1', serviceAreaId: 'area-1', campusId: 'campus-1' }) },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'SECRETARY' }) },
      serviceMembership: { findFirst: jest.fn().mockResolvedValue({ id: 'membership-1' }) },
      event: { findFirst: jest.fn().mockResolvedValue(null) },
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
      event: { findFirst: jest.fn().mockResolvedValue(null) },
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

  it('vincula automaticamente a escala independente ao Culto aprovado do mesmo campus e horário', async () => {
    const culto = { id: 'culto-1', inicio: new Date('2026-08-16T22:30:00.000Z'), fim: new Date('2026-08-17T00:00:00.000Z') };
    const prisma: any = {
      serviceTeam: { findFirst: jest.fn().mockResolvedValue({ id: 'team-1', serviceAreaId: 'area-1', campusId: 'campus-1' }) },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'SECRETARY' }) },
      serviceMembership: { findFirst: jest.fn().mockResolvedValue({ id: 'membership-1', funcoes: ['Guitarra'] }) },
      event: { findFirst: jest.fn().mockResolvedValue(culto) },
      serviceSchedule: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'schedule-1', personId: 'person-2', funcao: 'Guitarra', data: culto.inicio, eventId: culto.id, teamId: 'team-1', team: { serviceAreaId: 'area-1' } }),
      },
      notification: { create: jest.fn().mockResolvedValue({ id: 'notification-1' }) },
    };
    const service = new ServiceAreaService(prisma);

    await service.createSchedule('team-1', {
      personId: 'person-2',
      data: '2026-08-16T22:30:00.000Z',
      funcao: 'Guitarra',
    }, context);

    expect(prisma.event.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ campusId: 'campus-1', type: 'WORSHIP', status: 'APPROVED' }),
    }));
    expect(prisma.serviceSchedule.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ eventId: 'culto-1' }),
    }));
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

  it('cria uma solicitação de troca somente para integrante disponível com a mesma função', async () => {
    const schedule = {
      id: 'schedule-1', personId: 'person-1', teamId: 'team-1', eventId: 'event-1', status: 'CONFIRMED', funcao: 'Guitarra', data: new Date('2027-08-16T22:30:00.000Z'),
      person: { id: 'person-1', nome: 'Pessoa Escalada' },
      team: { serviceAreaId: 'area-music', campusId: 'campus-1' },
      event: { id: 'event-1', titulo: 'Culto de Domingo', inicio: new Date('2027-08-16T22:30:00.000Z'), fim: new Date('2027-08-16T23:50:00.000Z') },
    };
    const request = { id: 'swap-1', requesterPerson: schedule.person, replacementPerson: { id: 'person-2', nome: 'Outro Guitarrista' }, schedule };
    const prisma: any = {
      serviceSchedule: { findFirst: jest.fn().mockResolvedValueOnce(schedule).mockResolvedValue(null) },
      serviceMembership: {
        findFirst: jest.fn().mockResolvedValue({ id: 'membership-2', funcoes: ['Guitarra'], person: { nome: 'Outro Guitarrista' } }),
        findMany: jest.fn().mockResolvedValue([{ personId: 'leader-1' }]),
      },
      serviceScheduleSwapRequest: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue(request) },
      notification: { create: jest.fn().mockResolvedValue({ id: 'notification-1' }) },
    };
    const service = new ServiceAreaService(prisma);

    await expect(service.createScheduleSwapRequest('schedule-1', { replacementPersonId: 'person-2', reason: 'Estarei viajando.' }, context)).resolves.toEqual(request);
    expect(prisma.serviceScheduleSwapRequest.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ scheduleId: 'schedule-1', requesterPersonId: 'person-1', replacementPersonId: 'person-2' }),
    }));
    expect(prisma.notification.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ titulo: 'Solicitação de troca de escala', recipients: { create: [{ personId: 'leader-1' }] } }),
    }));
  });

  it('impede solicitação de troca quando a pessoa indicada não possui a função escalada', async () => {
    const schedule = {
      id: 'schedule-1', personId: 'person-1', teamId: 'team-1', eventId: null, status: 'SCHEDULED', funcao: 'Guitarra', data: new Date('2027-08-16T22:30:00.000Z'),
      person: { id: 'person-1', nome: 'Pessoa Escalada' },
      team: { serviceAreaId: 'area-music', campusId: 'campus-1' }, event: null,
    };
    const prisma: any = {
      serviceSchedule: { findFirst: jest.fn().mockResolvedValue(schedule) },
      serviceMembership: { findFirst: jest.fn().mockResolvedValue({ id: 'membership-2', funcoes: ['Vocal'], person: { nome: 'Vocalista' } }) },
    };
    const service = new ServiceAreaService(prisma);

    await expect(service.createScheduleSwapRequest('schedule-1', { replacementPersonId: 'person-2' }, context)).rejects.toThrow('não possui a função Guitarra');
  });

  it('efetiva a troca somente quando a liderança aprova a solicitação pendente', async () => {
    const schedule = {
      id: 'schedule-1', personId: 'person-1', teamId: 'team-1', eventId: null, status: 'CONFIRMED', funcao: 'Guitarra', data: new Date('2027-08-16T22:30:00.000Z'),
      person: { id: 'person-1', nome: 'Pessoa Escalada' },
      team: { serviceAreaId: 'area-music', campusId: 'campus-1' }, event: null,
    };
    const request = {
      id: 'swap-1', status: 'PENDING', requesterPersonId: 'person-1', replacementPersonId: 'person-2', scheduleId: 'schedule-1', reason: 'Viagem',
      requesterPerson: schedule.person, replacementPerson: { id: 'person-2', nome: 'Outro Guitarrista' }, schedule,
    };
    const updated = { ...schedule, personId: 'person-2', status: 'SCHEDULED', person: { id: 'person-2', nome: 'Outro Guitarrista' } };
    const prisma: any = {
      serviceScheduleSwapRequest: { findFirst: jest.fn().mockResolvedValue(request), update: jest.fn().mockResolvedValue({ ...request, status: 'APPROVED' }) },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'SECRETARY' }) },
      serviceMembership: { findFirst: jest.fn().mockResolvedValue({ id: 'membership-2', funcoes: ['Guitarra'], person: { nome: 'Outro Guitarrista' } }) },
      serviceSchedule: { findFirst: jest.fn().mockResolvedValue(null), update: jest.fn().mockResolvedValue(updated) },
      $transaction: jest.fn((operations) => Promise.all(operations)),
      notification: { create: jest.fn().mockResolvedValue({ id: 'notification-1' }) },
    };
    const service = new ServiceAreaService(prisma);

    await expect(service.approveScheduleSwapRequest('swap-1', context)).resolves.toEqual(expect.objectContaining({ status: 'APPROVED' }));
    expect(prisma.serviceSchedule.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ personId: 'person-2', status: 'SCHEDULED' }),
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
