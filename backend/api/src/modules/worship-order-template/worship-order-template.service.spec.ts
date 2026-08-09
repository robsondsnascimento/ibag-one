import { WorshipOrderTemplateService } from './worship-order-template.service';

describe('WorshipOrderTemplateService', () => {
  const context = { userId: 'user-1', personId: 'person-1', organizationId: 'org-1' };

  it('torna exclusivo o modelo padrão da organização ao criar um novo', async () => {
    const tx: any = {
      worshipOrderTemplate: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        create: jest.fn().mockResolvedValue({ id: 'template-2', padrao: true }),
      },
    };
    const prisma: any = {
      user: { findFirst: jest.fn().mockResolvedValue({ role: 'WORSHIP_ORDER_MANAGER' }) },
      serviceArea: { findFirst: jest.fn().mockResolvedValue({ id: 'area-1', scope: 'GLOBAL' }) },
      $transaction: jest.fn(callback => callback(tx)),
    };
    const service = new WorshipOrderTemplateService(prisma);

    await expect(service.create({
      nome: 'Culto de domingo',
      padrao: true,
      items: [{ sequencia: 1, titulo: 'Abertura', serviceAreaId: 'area-1' }],
    }, context)).resolves.toEqual({ id: 'template-2', padrao: true });

    expect(tx.worshipOrderTemplate.updateMany).toHaveBeenCalledWith({
      where: { organizationId: 'org-1', padrao: true },
      data: { padrao: false },
    });
  });
});
