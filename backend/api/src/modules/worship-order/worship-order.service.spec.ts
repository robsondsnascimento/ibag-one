import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { WorshipOrderService } from './worship-order.service';

describe('WorshipOrderService', () => {
  const context = { userId: 'user-1', personId: 'person-1', organizationId: 'org-1' };
  const event = { id: 'event-1', campusId: 'campus-1', createdByUserId: 'user-2', responsiblePersonId: null, serviceAreas: [{ serviceAreaId: 'area-1' }] };

  it('cria um rascunho independente a partir de um modelo padrão', async () => {
    const prisma: any = {
      event: { findFirst: jest.fn().mockResolvedValue(event) },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'WORSHIP_ORDER_MANAGER' }) },
      worshipOrder: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue({ id: 'order-1' }) },
    };
    const templates: any = {
      findForApplication: jest.fn().mockResolvedValue({
        id: 'template-1',
        items: [{ sequencia: 1, titulo: 'Abertura', horario: '19:30', observacoes: null, serviceAreaId: 'area-1' }],
      }),
    };
    const service = new WorshipOrderService(prisma, templates);

    await expect(service.createFromTemplate({ eventId: 'event-1' }, context)).resolves.toEqual({ id: 'order-1' });
    expect(prisma.worshipOrder.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        eventId: 'event-1',
        templateId: 'template-1',
        items: { create: [expect.objectContaining({ titulo: 'Abertura', serviceAreaId: 'area-1' })] },
      }),
    }));
  });

  it('não aplica um modelo quando o culto não envolve a área de serviço do item', async () => {
    const prisma: any = {
      event: { findFirst: jest.fn().mockResolvedValue({ ...event, serviceAreas: [] }) },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'WORSHIP_ORDER_MANAGER' }) },
      worshipOrder: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn() },
    };
    const templates: any = {
      findForApplication: jest.fn().mockResolvedValue({
        id: 'template-1',
        items: [{ sequencia: 1, titulo: 'Louvor', horario: null, observacoes: null, serviceAreaId: 'area-1' }],
      }),
    };
    const service = new WorshipOrderService(prisma, templates);

    await expect(service.createFromTemplate({ eventId: 'event-1' }, context)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.worshipOrder.create).not.toHaveBeenCalled();
  });

  it('envia alerta para áreas envolvidas, escalados e responsáveis sem duplicar destinatários', async () => {
    const order = {
      id: 'order-1',
      status: 'PUBLISHED',
      event: {
        ...event,
        schedules: [{ personId: 'person-scale' }],
      },
      items: [{ responsiblePersonId: 'person-item', demands: [{ responsiblePersonId: 'person-demand' }] }],
    };
    const prisma: any = {
      worshipOrder: { findFirst: jest.fn().mockResolvedValue(order) },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'WORSHIP_ORDER_MANAGER' }) },
      serviceMembership: { findMany: jest.fn().mockResolvedValue([{ personId: 'person-area' }, { personId: 'person-scale' }]) },
      person: { findMany: jest.fn().mockResolvedValue([{ id: 'person-area' }, { id: 'person-scale' }, { id: 'person-item' }, { id: 'person-demand' }]) },
      notification: { create: jest.fn().mockResolvedValue({ id: 'notification-1' }) },
    };
    const service = new WorshipOrderService(prisma, {} as any, {} as any);

    await expect(service.sendAlert('order-1', { titulo: 'Ordem publicada', mensagem: 'Confira suas responsabilidades.' }, context)).resolves.toEqual({ id: 'notification-1' });
    expect(prisma.notification.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        eventId: 'event-1',
        recipients: { create: expect.arrayContaining([{ personId: 'person-area' }, { personId: 'person-scale' }, { personId: 'person-item' }, { personId: 'person-demand' }]) },
      }),
    }));
  });

  it('conclui automaticamente o fluxo do repertório ao concluir a pendência da Ordem de Culto', async () => {
    const prisma: any = {
      worshipServiceDemand: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'demand-1',
          status: 'PENDING',
          responsiblePersonId: 'person-1',
          repertoireDelivery: { id: 'repertoire-1' },
          item: { order: { event } },
        }),
        update: jest.fn().mockResolvedValue({ id: 'demand-1', status: 'COMPLETED' }),
      },
      worshipRepertoire: { update: jest.fn().mockResolvedValue({ id: 'repertoire-1', status: 'COMPLETED' }) },
    };
    const service = new WorshipOrderService(prisma, {} as any, {} as any);

    await expect(service.completeDemand('demand-1', context)).resolves.toEqual({ id: 'demand-1', status: 'COMPLETED' });
    expect(prisma.worshipRepertoire.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'repertoire-1' },
      data: expect.objectContaining({ status: 'COMPLETED' }),
    }));
  });

  it('exibe as escalas do evento na ordem sem vinculá-las aos itens', async () => {
    const prisma: any = {
      worshipOrder: { findFirst: jest.fn().mockResolvedValue({ id: 'order-1', event, items: [] }) },
    };
    const service = new WorshipOrderService(prisma);

    await expect(service.findOne('order-1', context)).resolves.toEqual({ id: 'order-1', event, items: [] });
    expect(prisma.worshipOrder.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      include: expect.objectContaining({
        event: expect.objectContaining({ include: expect.objectContaining({ schedules: expect.anything() }) }),
      }),
    }));
  });

  it('bloqueia a edição de um item depois da publicação da ordem', async () => {
    const prisma: any = {
      worshipOrderItem: { findFirst: jest.fn().mockResolvedValue({ id: 'item-1', order: { status: 'PUBLISHED', event } }) },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'SECRETARY' }) },
    };
    const service = new WorshipOrderService(prisma);

    await expect(service.updateItem('item-1', { titulo: 'Abertura' }, context)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('exige todos os itens ao reordenar a ordem', async () => {
    const prisma: any = {
      worshipOrder: { findFirst: jest.fn().mockResolvedValue({ id: 'order-1', status: 'DRAFT', event, items: [] }) },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'SECRETARY' }) },
      worshipOrderItem: { findMany: jest.fn().mockResolvedValue([{ id: 'item-1', sequencia: 1 }, { id: 'item-2', sequencia: 2 }]) },
    };
    const service = new WorshipOrderService(prisma);

    await expect(service.reorderItems('order-1', { items: [{ id: 'item-1', sequencia: 2 }] }, context)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('cancela uma demanda pendente pela liderança da ordem', async () => {
    const prisma: any = {
      worshipServiceDemand: {
        findFirst: jest.fn().mockResolvedValue({ id: 'demand-1', status: 'PENDING', item: { order: { event } } }),
        update: jest.fn().mockResolvedValue({ id: 'demand-1', status: 'CANCELLED' }),
      },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'SECRETARY' }) },
    };
    const service = new WorshipOrderService(prisma);

    await expect(service.cancelDemand('demand-1', context)).resolves.toEqual({ id: 'demand-1', status: 'CANCELLED' });
  });

  it('notifica os integrantes da área quando cria uma demanda', async () => {
    const prisma: any = {
      worshipOrderItem: { findFirst: jest.fn().mockResolvedValue({ id: 'item-1', titulo: 'Louvor', order: { status: 'DRAFT', event } }) },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'SECRETARY' }) },
      serviceArea: { findFirst: jest.fn().mockResolvedValue({ id: 'area-1' }) },
      worshipServiceDemand: { create: jest.fn().mockResolvedValue({ id: 'demand-1' }) },
      serviceMembership: { findMany: jest.fn().mockResolvedValue([{ personId: 'person-area-1' }]) },
      notification: { create: jest.fn().mockResolvedValue({ id: 'notification-1' }) },
    };
    const service = new WorshipOrderService(prisma);

    await expect(service.addDemand('item-1', { descricao: 'Enviar repertório', serviceAreaId: 'area-1' }, context)).resolves.toEqual({ id: 'demand-1' });
    expect(prisma.notification.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ serviceAreaId: 'area-1' }) }));
  });

  it('impede uma segunda ordem para o mesmo culto', async () => {
    const prisma: any = {
      event: { findFirst: jest.fn().mockResolvedValue(event) },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'SECRETARY' }) },
      worshipOrder: { findUnique: jest.fn().mockResolvedValue({ id: 'order-1' }) },
    };
    const service = new WorshipOrderService(prisma);

    await expect(service.create({ eventId: 'event-1' }, context)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('permite que o responsÃ¡vel por ordem de culto monte ordens em qualquer campus da organizaÃ§Ã£o', async () => {
    const prisma: any = {
      event: { findFirst: jest.fn().mockResolvedValue(event) },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'MEMBER', additionalRoles: [{ role: 'WORSHIP_ORDER_MANAGER' }] }) },
      worshipOrder: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'order-1', eventId: 'event-1' }),
      },
    };
    const service = new WorshipOrderService(prisma);

    await expect(service.create({ eventId: 'event-1' }, context)).resolves.toEqual({ id: 'order-1', eventId: 'event-1' });
  });

  it('impede publicar uma ordem sem itens', async () => {
    const prisma: any = {
      worshipOrder: { findFirst: jest.fn().mockResolvedValue({ id: 'order-1', status: 'DRAFT', event, items: [] }) },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'SECRETARY' }) },
    };
    const service = new WorshipOrderService(prisma);

    await expect(service.publish('order-1', context)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('bloqueia a inclusÃ£o de itens por quem nÃ£o administra o culto', async () => {
    const prisma: any = {
      worshipOrder: { findFirst: jest.fn().mockResolvedValue({ id: 'order-1', status: 'DRAFT', event, items: [] }) },
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'MEMBER' }) },
    };
    const service = new WorshipOrderService(prisma);

    await expect(service.addItem('order-1', { sequencia: 1, titulo: 'Abertura' }, context)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('permite que o responsÃ¡vel da demanda a conclua', async () => {
    const prisma: any = {
      worshipServiceDemand: {
        findFirst: jest.fn().mockResolvedValue({ id: 'demand-1', status: 'PENDING', responsiblePersonId: 'person-1', item: { order: { event } } }),
        update: jest.fn().mockResolvedValue({ id: 'demand-1', status: 'COMPLETED' }),
      },
    };
    const service = new WorshipOrderService(prisma);

    await expect(service.completeDemand('demand-1', context)).resolves.toEqual({ id: 'demand-1', status: 'COMPLETED' });
    expect(prisma.worshipServiceDemand.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'COMPLETED' }) }));
  });
});
