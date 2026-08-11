import { Test, TestingModule } from '@nestjs/testing';
import { CampusService } from './campus.service';
import { PrismaService } from '../../database/prisma.service';

describe('CampusService', () => {
  let service: CampusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CampusService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<CampusService>(CampusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('lists only active campuses from the current organization', async () => {
    const prisma = {
      campus: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const instance = new CampusService(prisma as never);

    await instance.findAll({ userId: 'user-1', personId: 'person-1', organizationId: 'organization-1' });

    expect(prisma.campus.findMany).toHaveBeenCalledWith({
      where: { organizationId: 'organization-1', ativo: true },
      orderBy: { nome: 'asc' },
    });
  });
});
