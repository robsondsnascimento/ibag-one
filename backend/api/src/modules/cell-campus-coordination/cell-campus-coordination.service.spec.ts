import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CellCampusCoordinationService } from './cell-campus-coordination.service';

describe('CellCampusCoordinationService', () => {
  const context = { userId: 'user-id', personId: 'authenticated-person-id', organizationId: 'organization-id' };
  const dto = { personId: 'person-id', campusId: 'campus-id' };
  const prisma = {
    user: { findFirst: jest.fn() },
    person: { findFirst: jest.fn() },
    campus: { findFirst: jest.fn() },
    cellCampusCoordination: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
  };
  let service: CellCampusCoordinationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CellCampusCoordinationService(prisma as never);
  });

  it('creates a coordination when a pastor manages an active person and campus', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: context.userId, role: 'PASTOR', person: { campusId: dto.campusId }, additionalRoles: [] });
    prisma.person.findFirst.mockResolvedValue({ id: dto.personId });
    prisma.campus.findFirst.mockResolvedValue({ id: dto.campusId });
    prisma.cellCampusCoordination.findFirst.mockResolvedValue(null);
    prisma.cellCampusCoordination.create.mockResolvedValue({ id: 'coordination-id' });

    await expect(service.create(dto, context)).resolves.toEqual({ id: 'coordination-id' });
    expect(prisma.cellCampusCoordination.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ personId: dto.personId, campusId: dto.campusId, ativo: true }),
    }));
  });

  it('rejects a duplicated active coordination in the same campus', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: context.userId, role: 'PASTOR', person: { campusId: dto.campusId }, additionalRoles: [] });
    prisma.person.findFirst.mockResolvedValue({ id: dto.personId });
    prisma.campus.findFirst.mockResolvedValue({ id: dto.campusId });
    prisma.cellCampusCoordination.findFirst.mockResolvedValue({ id: 'existing-id' });

    await expect(service.create(dto, context)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.cellCampusCoordination.create).not.toHaveBeenCalled();
  });

  it('does not let a pastor manage coordination in another campus', async () => {
    prisma.person.findFirst.mockResolvedValue({ id: dto.personId });
    prisma.campus.findFirst.mockResolvedValue({ id: dto.campusId });
    prisma.user.findFirst.mockResolvedValue({ id: context.userId, role: 'PASTOR', person: { campusId: 'another-campus-id' }, additionalRoles: [] });

    await expect(service.create(dto, context)).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.cellCampusCoordination.create).not.toHaveBeenCalled();
  });

  it('only returns coordinations from the coordinator campuses', async () => {
    prisma.user.findFirst.mockResolvedValueOnce({ id: context.userId, role: 'MEMBER', person: { campusId: 'another-campus-id' }, additionalRoles: [] });
    prisma.cellCampusCoordination.findMany.mockResolvedValueOnce([{ campusId: dto.campusId }]);
    prisma.cellCampusCoordination.findMany.mockResolvedValueOnce([]);

    await service.findAll(context);

    expect(prisma.cellCampusCoordination.findMany).toHaveBeenLastCalledWith(expect.objectContaining({
      where: expect.objectContaining({ campus: expect.objectContaining({ id: { in: [dto.campusId] } }) }),
    }));
  });

  it('rejects listing coordinations without a central role or active coordination', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.cellCampusCoordination.findMany.mockResolvedValue([]);

    await expect(service.findAll(context)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
