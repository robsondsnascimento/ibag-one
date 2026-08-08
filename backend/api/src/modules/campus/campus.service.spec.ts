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
});
