import { ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrganizationContext } from '../../common/context/organization-context';
import { CellStudyService } from './cell-study.service';

describe('CellStudyService', () => {
  const context: OrganizationContext = {
    userId: 'user-id',
    personId: 'person-id',
    organizationId: 'organization-id',
  };

  const membership = {
    cellId: 'cell-id',
    cell: { organizationId: 'organization-id' },
  };

  it('blocks the current study when the previous week meeting is not completed', async () => {
    const prisma = {
      cellMembership: { findFirst: jest.fn().mockResolvedValue(membership) },
      cellMeeting: { findFirst: jest.fn().mockResolvedValue({ registroConcluidoEm: null }) },
      cellStudy: { findUnique: jest.fn() },
    };
    const service = new CellStudyService(prisma as unknown as PrismaService);

    await expect(service.current(context)).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.cellStudy.findUnique).not.toHaveBeenCalled();
  });

  it('releases the current study when the previous week meeting was completed', async () => {
    const study = { id: 'study-id', titulo: 'Estudo da semana' };
    const prisma = {
      cellMembership: { findFirst: jest.fn().mockResolvedValue(membership) },
      cellMeeting: { findFirst: jest.fn().mockResolvedValue({ registroConcluidoEm: new Date() }) },
      cellStudy: { findUnique: jest.fn().mockResolvedValue(study) },
    };
    const service = new CellStudyService(prisma as unknown as PrismaService);

    await expect(service.current(context)).resolves.toEqual(study);
    expect(prisma.cellStudy.findUnique).toHaveBeenCalledTimes(1);
  });

  it('releases the current study for a new cell without a previous meeting', async () => {
    const study = { id: 'study-id', titulo: 'Estudo da semana' };
    const prisma = {
      cellMembership: { findFirst: jest.fn().mockResolvedValue(membership) },
      cellMeeting: { findFirst: jest.fn().mockResolvedValue(null) },
      cellStudy: { findUnique: jest.fn().mockResolvedValue(study) },
    };
    const service = new CellStudyService(prisma as unknown as PrismaService);

    await expect(service.current(context)).resolves.toEqual(study);
  });

  it('returns the study selected by the secretary for a week', async () => {
    const study = { id: 'study-id', titulo: 'Estudo da semana' };
    const prisma = {
      user: { findFirst: jest.fn().mockResolvedValue({ id: context.userId }) },
      cellStudy: { findUnique: jest.fn().mockResolvedValue(study) },
    };
    const service = new CellStudyService(prisma as unknown as PrismaService);

    await expect(service.findForWeek('2026-08-12', context)).resolves.toEqual(study);
    expect(prisma.cellStudy.findUnique).toHaveBeenCalledTimes(1);
  });

  it('prevents a second study from being published for the same week', async () => {
    const prisma = {
      user: { findFirst: jest.fn().mockResolvedValue({ id: context.userId }) },
      cellStudy: { findUnique: jest.fn().mockResolvedValue({ id: 'existing-study' }) },
    };
    const service = new CellStudyService(prisma as unknown as PrismaService);

    await expect(service.create(
      { titulo: 'Estudo da semana', weekStart: '2026-08-10' },
      { filename: 'study.pdf', originalname: 'study.pdf' },
      context,
    )).rejects.toBeInstanceOf(ConflictException);
  });
});
