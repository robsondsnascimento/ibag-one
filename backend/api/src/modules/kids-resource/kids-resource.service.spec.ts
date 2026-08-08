import { ForbiddenException } from '@nestjs/common';
import { KidsResourceService } from './kids-resource.service';

describe('KidsResourceService — lembrete de devolução', () => {
  const context = { userId: 'user-1', personId: 'leader-1', organizationId: 'org-1' };
  it('bloqueia lembrete quando a pessoa não é Líder de Culto escalado', async () => {
    const prisma: any = {
      kidsResourceRequest: { findFirst: jest.fn().mockResolvedValue({ id: 'request-1', organizationId: 'org-1', eventId: 'event-1', requestedByPersonId: 'servo-1', event: { campusId: 'campus-1' }, items: [{ resource: { nome: 'Painel' } }] }) },
      kidsOperationalRoleAssignment: { findFirst: jest.fn().mockResolvedValue(null) },
      serviceSchedule: { findFirst: jest.fn().mockResolvedValue({ id: 'schedule-1' }) },
    };
    const service = new KidsResourceService(prisma);
    await expect(service.remind('request-1', context)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
