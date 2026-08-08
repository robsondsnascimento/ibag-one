import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { WorshipOrderService } from './worship-order.service';

describe('WorshipOrderService', () => {
  const context = { userId: 'user-1', personId: 'person-1', organizationId: 'org-1' };
  const event = { id: 'event-1', campusId: 'campus-1', createdByUserId: 'user-2', responsiblePersonId: null, serviceAreas: [{ serviceAreaId: 'area-1' }] };

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
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'WORSHIP_ORDER_MANAGER' }) },
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
