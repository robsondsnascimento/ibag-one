import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  const prisma = { $queryRaw: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('confirma a prontidão quando o banco responde', async () => {
    prisma.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);

    await expect(service.ready()).resolves.toEqual(expect.objectContaining({ database: 'ok' }));
  });

  it('informa indisponibilidade quando o banco não responde', async () => {
    prisma.$queryRaw.mockRejectedValueOnce(new Error('database offline'));

    await expect(service.ready()).rejects.toMatchObject({ status: 503 });
  });
});
