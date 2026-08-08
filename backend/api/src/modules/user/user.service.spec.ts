import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../database/prisma.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('concede uma função adicional sem alterar a função principal', async () => {
    const prisma: any = {
      user: {
        findFirst: jest.fn()
          .mockResolvedValueOnce({ id: 'admin-1' })
          .mockResolvedValueOnce({ id: 'user-1', role: 'PASTOR' }),
      },
      userRoleAssignment: {
        upsert: jest.fn().mockResolvedValue({ id: 'assignment-1', role: 'WORSHIP_ORDER_MANAGER' }),
      },
    };
    const instance = new UserService(prisma);
    const context = { userId: 'admin-1', personId: 'person-admin', organizationId: 'org-1' };

    await expect(instance.assignAdditionalRole('user-1', { role: 'WORSHIP_ORDER_MANAGER' }, context)).resolves.toEqual({ id: 'assignment-1', role: 'WORSHIP_ORDER_MANAGER' });
    expect(prisma.userRoleAssignment.upsert).toHaveBeenCalledWith(expect.objectContaining({
      create: expect.objectContaining({ userId: 'user-1', role: 'WORSHIP_ORDER_MANAGER' }),
    }));
  });
});
