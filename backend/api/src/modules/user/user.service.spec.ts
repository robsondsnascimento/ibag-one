import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../database/prisma.service';

describe('UserService', () => {
  let service: UserService;

  it('cria login para uma pessoa ativa da organização', async () => {
    const prisma: any = {
      user: {
        findFirst: jest.fn().mockResolvedValue({ id: 'admin-1' }),
        findUnique: jest.fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(null),
        create: jest.fn().mockResolvedValue({ id: 'user-2', loginEmail: 'ana.silva@ibag.one', ativo: true, role: 'MEMBER' }),
      },
      person: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'person-2',
          nome: 'Ana Silva',
          organization: { id: 'org-1', dominio: 'ibag.one' },
        }),
      },
    };
    const instance = new UserService(prisma);
    const context = { userId: 'admin-1', personId: 'person-admin', organizationId: 'org-1' };

    await expect(instance.createForPerson('person-2', { password: 'senha-segura' }, context)).resolves.toEqual({ id: 'user-2', loginEmail: 'ana.silva@ibag.one', ativo: true, role: 'MEMBER' });
    expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ personId: 'person-2', organizationId: 'org-1', loginEmail: 'ana.silva@ibag.one' }),
    }));
  });

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
