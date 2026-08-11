import { WorshipRepertoireService } from './worship-repertoire.service';

describe('WorshipRepertoireService', () => {
  const context = { userId: 'user-1', personId: 'person-1', organizationId: 'org-1' };

  it('envia o repertório do ministro para os líderes de louvor', async () => {
    const repertoire = {
      id: 'repertoire-1',
      status: 'DRAFT',
      organizationId: 'org-1',
      eventId: 'event-1',
      serviceAreaId: 'area-music',
      submittedByPersonId: 'person-1',
      songs: [{ id: 'song-1', sequencia: 1, titulo: 'Canção' }],
      event: { id: 'event-1', titulo: 'Culto Domingo', inicio: new Date('2099-08-13T22:30:00.000Z'), campusId: 'campus-1', serviceAreas: [{ serviceAreaId: 'area-music' }] },
    };
    const prisma: any = {
      worshipRepertoire: {
        findFirst: jest.fn().mockResolvedValue(repertoire),
        update: jest.fn().mockResolvedValue({ ...repertoire, status: 'SUBMITTED' }),
      },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'MEMBER' }) },
      serviceMembership: {
        findFirst: jest.fn().mockResolvedValue({ id: 'membership-1' }),
        findMany: jest.fn().mockResolvedValue([{ personId: 'leader-1' }]),
      },
      serviceOperationalRoleAssignment: { findFirst: jest.fn().mockResolvedValue({ id: 'minister-role-1' }) },
      serviceSchedule: { findFirst: jest.fn().mockResolvedValue({ eventId: 'event-1' }) },
      notification: { create: jest.fn().mockResolvedValue({ id: 'notification-1' }) },
    };
    const service = new WorshipRepertoireService(prisma);

    await expect(service.submit('repertoire-1', context)).resolves.toEqual(expect.objectContaining({ status: 'SUBMITTED' }));
    expect(prisma.notification.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        titulo: 'Repertório aguardando aprovação',
        recipients: { create: [{ personId: 'leader-1' }] },
      }),
    }));
  });

  it('encaminha as músicas aprovadas para a área de Ordem de Culto', async () => {
    const repertoire = {
      id: 'repertoire-1',
      status: 'APPROVED',
      organizationId: 'org-1',
      eventId: 'event-1',
      serviceAreaId: 'area-music',
      songs: [{ sequencia: 1, titulo: 'Canção', tom: 'G', referencia: 'https://example.com/song' }],
      event: {
        id: 'event-1',
        titulo: 'Culto Domingo',
        inicio: new Date('2099-08-13T22:30:00.000Z'),
        campusId: 'campus-1',
        serviceAreas: [{ serviceAreaId: 'area-music' }, { serviceAreaId: 'area-order' }],
      },
    };
    const tx: any = {
      worshipOrderMaterial: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
      worshipServiceDemand: { create: jest.fn().mockResolvedValue({ id: 'demand-1' }) },
      worshipRepertoire: { update: jest.fn().mockResolvedValue({}) },
    };
    const prisma: any = {
      worshipRepertoire: { findFirst: jest.fn().mockResolvedValue(repertoire) },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'WORSHIP_ORDER_MANAGER' }) },
      worshipOrderItem: { findFirst: jest.fn().mockResolvedValue({ id: 'item-louvor', titulo: 'Louvor', order: { status: 'DRAFT' } }) },
      serviceArea: { findFirst: jest.fn().mockResolvedValue({ id: 'area-order' }) },
      $transaction: jest.fn(callback => callback(tx)),
      serviceMembership: { findMany: jest.fn().mockResolvedValue([{ personId: 'order-person-1' }]) },
      notification: { create: jest.fn().mockResolvedValue({ id: 'notification-1' }) },
    };
    const service = new WorshipRepertoireService(prisma);

    await service.sendToWorshipOrder('repertoire-1', { orderItemId: 'item-louvor', receivingServiceAreaId: 'area-order' }, context);

    expect(tx.worshipOrderMaterial.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({ titulo: '1. Canção (G)', itemId: 'item-louvor', type: 'MUSIC' })],
    });
    expect(tx.worshipServiceDemand.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ serviceAreaId: 'area-order', itemId: 'item-louvor' }),
    }));
  });

  it('distribui as músicas nas posições do modelo de Cachoeirinha quando não há item manual', async () => {
    const repertoire = {
      id: 'repertoire-1', status: 'APPROVED', organizationId: 'org-1', eventId: 'event-1', serviceAreaId: 'area-music',
      songs: [
        { sequencia: 1, titulo: 'Canção de abertura', tom: 'G', referencia: null, observacoes: 'Celebração · início do culto' },
        { sequencia: 2, titulo: 'Canção final', tom: 'D', referencia: null, observacoes: 'Celebração · final do culto' },
      ],
      event: { id: 'event-1', titulo: 'Culto Domingo', inicio: new Date('2099-08-13T22:30:00.000Z'), campusId: 'campus-1', serviceAreas: [{ serviceAreaId: 'area-music' }, { serviceAreaId: 'area-order' }] },
    };
    const tx: any = {
      worshipOrderMaterial: { createMany: jest.fn().mockResolvedValue({ count: 2 }) },
      worshipServiceDemand: { create: jest.fn().mockResolvedValue({ id: 'demand-1' }) },
      worshipRepertoire: { update: jest.fn().mockResolvedValue({}) },
    };
    const prisma: any = {
      worshipRepertoire: { findFirst: jest.fn().mockResolvedValue(repertoire) },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'WORSHIP_ORDER_MANAGER' }) },
      worshipOrder: { findFirst: jest.fn().mockResolvedValue({ status: 'DRAFT', items: [
        { id: 'opening', titulo: 'Celebração · início do culto', serviceAreaId: 'area-music' },
        { id: 'closing', titulo: 'Celebração · final do culto', serviceAreaId: 'area-music' },
      ] }) },
      serviceArea: { findFirst: jest.fn().mockResolvedValue({ id: 'area-order' }) },
      $transaction: jest.fn(callback => callback(tx)),
      serviceMembership: { findMany: jest.fn().mockResolvedValue([{ personId: 'order-person-1' }]) },
      notification: { create: jest.fn().mockResolvedValue({ id: 'notification-1' }) },
    };
    const service = new WorshipRepertoireService(prisma);

    await service.sendToWorshipOrder('repertoire-1', { receivingServiceAreaId: 'area-order' }, context);

    expect(tx.worshipOrderMaterial.createMany).toHaveBeenCalledWith(expect.objectContaining({
      data: [
        expect.objectContaining({ itemId: 'opening', titulo: '1. Canção de abertura (G)' }),
        expect.objectContaining({ itemId: 'closing', titulo: '2. Canção final (D)' }),
      ],
    }));
    expect(tx.worshipRepertoire.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ orderItemId: 'opening' }) }));
  });

  it('bloqueia o envio quando o ministro não possui escala confirmada no culto', async () => {
    const repertoire = {
      id: 'repertoire-1',
      status: 'DRAFT',
      organizationId: 'org-1',
      serviceAreaId: 'area-music',
      submittedByPersonId: 'person-1',
      songs: [{ id: 'song-1', sequencia: 1, titulo: 'Canção' }],
      event: { id: 'event-2', titulo: 'Culto Futuro', inicio: new Date('2099-08-20T22:30:00.000Z'), campusId: 'campus-1', serviceAreas: [{ serviceAreaId: 'area-music' }] },
    };
    const prisma: any = {
      worshipRepertoire: { findFirst: jest.fn().mockResolvedValue(repertoire) },
      serviceOperationalRoleAssignment: { findFirst: jest.fn().mockResolvedValue({ id: 'minister-role-1' }) },
      serviceSchedule: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    const service = new WorshipRepertoireService(prisma);

    await expect(service.submit('repertoire-1', context)).rejects.toThrow('escala confirmada');
  });

  it('reconhece a função Ministro no vínculo ativo da equipe', async () => {
    const prisma: any = {
      serviceOperationalRoleAssignment: { findFirst: jest.fn().mockResolvedValue(null) },
      serviceMembership: { findFirst: jest.fn().mockResolvedValue({ id: 'membership-minister' }) },
    };
    const service: any = new WorshipRepertoireService(prisma);

    await expect(service.assertMinister('area-music', context, 'team-1')).resolves.toBeUndefined();
    expect(prisma.serviceMembership.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        personId: 'person-1',
        serviceAreaId: 'area-music',
        teamId: 'team-1',
        ativo: true,
        funcoes: { has: 'Ministro' },
      }),
    }));
  });

  it('permite o envio atrasado e alerta os líderes de louvor', async () => {
    const repertoire = {
      id: 'repertoire-1',
      status: 'DRAFT',
      organizationId: 'org-1',
      eventId: 'event-1',
      serviceAreaId: 'area-music',
      submittedByPersonId: 'person-1',
      songs: [{ id: 'song-1', sequencia: 1, titulo: 'Canção' }],
      event: { id: 'event-1', titulo: 'Culto Domingo', inicio: new Date('2020-08-16T22:30:00.000Z'), campusId: 'campus-1', serviceAreas: [{ serviceAreaId: 'area-music' }] },
    };
    const prisma: any = {
      worshipRepertoire: { findFirst: jest.fn().mockResolvedValue(repertoire), update: jest.fn().mockResolvedValue({ ...repertoire, status: 'SUBMITTED' }) },
      serviceOperationalRoleAssignment: { findFirst: jest.fn().mockResolvedValue({ id: 'minister-role-1' }) },
      serviceSchedule: { findFirst: jest.fn().mockResolvedValue({ id: 'schedule-1' }) },
      serviceMembership: { findMany: jest.fn().mockResolvedValue([{ personId: 'leader-1' }]) },
      notification: { create: jest.fn().mockResolvedValue({ id: 'notification-1' }) },
    };
    const service = new WorshipRepertoireService(prisma);

    await expect(service.submit('repertoire-1', context)).resolves.toEqual(expect.objectContaining({ status: 'SUBMITTED', isLateSubmission: true }));
    expect(prisma.notification.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ titulo: 'Repertório enviado com atraso' }),
    }));
  });

  it('calcula o prazo de domingo e quinta para a segunda-feira da mesma semana', () => {
    const service: any = new WorshipRepertoireService({});

    const deadline = service.submissionDeadline(new Date('2026-08-16T22:30:00.000Z'));

    expect(deadline.toISOString()).toBe('2026-08-11T02:59:59.999Z');
  });
});
