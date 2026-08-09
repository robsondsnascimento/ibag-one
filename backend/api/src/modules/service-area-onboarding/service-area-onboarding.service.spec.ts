import { ServiceAreaOnboardingService } from './service-area-onboarding.service';

describe('ServiceAreaOnboardingService', () => {
  const context = { userId: 'user-1', personId: 'person-1', organizationId: 'org-1' };

  it('cria etapas ordenadas para o processo próprio da área', async () => {
    const prisma: any = {
      serviceArea: { findFirst: jest.fn().mockResolvedValue({ id: 'area-music' }) },
      user: { findFirst: jest.fn().mockResolvedValue({ id: 'user-1' }) },
      serviceAreaEntryStage: {
        aggregate: jest.fn().mockResolvedValue({ _max: { ordem: 2 } }),
        create: jest.fn().mockResolvedValue({ id: 'stage-3', ordem: 3, nome: 'Audição' }),
      },
    };
    const service = new ServiceAreaOnboardingService(prisma);

    await expect(service.createStage('area-music', { nome: 'Audição', obrigatoria: true }, context)).resolves.toEqual(expect.objectContaining({ ordem: 3 }));
    expect(prisma.serviceAreaEntryStage.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ serviceAreaId: 'area-music', ordem: 3 }) }));
  });

  it('permite que a própria pessoa manifeste interesse em uma área', async () => {
    const prisma: any = {
      serviceArea: { findFirst: jest.fn().mockResolvedValue({ id: 'area-music' }) },
      person: { findFirst: jest.fn().mockResolvedValue({ id: 'person-1' }) },
      serviceMembership: { findFirst: jest.fn().mockResolvedValue(null) },
      serviceAreaApplication: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'application-1', status: 'INTERESTED', personId: 'person-1' }),
      },
    };
    const service = new ServiceAreaOnboardingService(prisma);

    await expect(service.createApplication({ serviceAreaId: 'area-music', observacao: 'Tenho interesse em servir.' }, context)).resolves.toEqual(expect.objectContaining({ status: 'INTERESTED' }));
    expect(prisma.serviceAreaApplication.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ personId: 'person-1', serviceAreaId: 'area-music', createdByUserId: 'user-1' }),
    }));
  });

  it('não aprova enquanto existir etapa obrigatória pendente', async () => {
    const application = {
      id: 'application-1', status: 'IN_PROGRESS', serviceAreaId: 'area-music', personId: 'person-1', stageCompletions: [],
      serviceArea: { id: 'area-music', campusId: null }, desiredTeam: null,
    };
    const prisma: any = {
      serviceAreaApplication: { findFirst: jest.fn().mockResolvedValue(application) },
      serviceTeam: { findFirst: jest.fn().mockResolvedValue({ id: 'team-1', campusId: 'campus-1' }) },
      user: { findFirst: jest.fn().mockResolvedValue({ id: 'user-1' }) },
      serviceAreaEntryStage: { findMany: jest.fn().mockResolvedValue([{ id: 'stage-required' }]) },
    };
    const service = new ServiceAreaOnboardingService(prisma);

    await expect(service.approveApplication('application-1', { teamId: 'team-1' }, context)).rejects.toThrow('etapas obrigatórias pendentes');
  });

  it('aprova a pessoa e cria seu vínculo de integrante na equipe escolhida', async () => {
    const application = {
      id: 'application-1', status: 'IN_PROGRESS', serviceAreaId: 'area-music', personId: 'person-1', stageCompletions: [],
      serviceArea: { id: 'area-music', campusId: null }, desiredTeam: null,
    };
    const transaction = {
      serviceMembership: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue({ id: 'membership-1' }) },
      serviceAreaApplication: { update: jest.fn().mockResolvedValue({ id: 'application-1', status: 'APPROVED' }) },
    };
    const prisma: any = {
      serviceAreaApplication: { findFirst: jest.fn().mockResolvedValue(application) },
      serviceTeam: { findFirst: jest.fn().mockResolvedValue({ id: 'team-1', campusId: 'campus-1' }) },
      user: { findFirst: jest.fn().mockResolvedValue({ id: 'user-1' }) },
      serviceAreaEntryStage: { findMany: jest.fn().mockResolvedValue([]) },
      $transaction: jest.fn(callback => callback(transaction)),
    };
    const service = new ServiceAreaOnboardingService(prisma);

    await expect(service.approveApplication('application-1', { teamId: 'team-1' }, context)).resolves.toEqual(expect.objectContaining({ status: 'APPROVED' }));
    expect(transaction.serviceMembership.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ personId: 'person-1', serviceAreaId: 'area-music', teamId: 'team-1', role: 'MEMBER' }),
    }));
  });
});
