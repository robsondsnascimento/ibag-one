import { Test, TestingModule } from '@nestjs/testing';
import { PersonService } from './person.service';
import { PrismaService } from '../../database/prisma.service';

describe('PersonService', () => {
  let service: PersonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<PersonService>(PersonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('update', () => {
    const context = {
      userId: 'user-id',
      personId: 'person-id',
      organizationId: 'organization-id',
    };

    it('keeps the person in the current organization when updating', async () => {
      const prisma = {
        user: {
          findFirst: jest.fn().mockResolvedValue({ id: 'user-id' }),
        },
        person: {
          findFirst: jest.fn().mockResolvedValue({ id: 'person-id' }),
          update: jest.fn().mockResolvedValue({ id: 'person-id' }),
        },
        campus: {
          findFirst: jest.fn().mockResolvedValue({ id: 'campus-id' }),
        },
      };
      const personService = new PersonService(prisma as unknown as PrismaService);

      await personService.update(
        'person-id',
        {
          nome: 'Pessoa Atualizada',
          campusId: 'campus-id',
          organizationId: 'another-organization-id',
        },
        context,
      );

      expect(prisma.campus.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'campus-id',
          organizationId: context.organizationId,
        },
      });
      expect(prisma.person.update).toHaveBeenCalledWith({
        where: { id: 'person-id' },
        data: {
          nome: 'Pessoa Atualizada',
          campusId: 'campus-id',
        },
        include: { campus: true },
      });
    });

    it('rejects a campus from another organization when updating', async () => {
      const prisma = {
        user: {
          findFirst: jest.fn().mockResolvedValue({ id: 'user-id' }),
        },
        person: {
          findFirst: jest.fn().mockResolvedValue({ id: 'person-id' }),
          update: jest.fn(),
        },
        campus: {
          findFirst: jest.fn().mockResolvedValue(null),
        },
      };
      const personService = new PersonService(prisma as unknown as PrismaService);

      await expect(
        personService.update(
          'person-id',
          { campusId: 'foreign-campus-id' },
          context,
        ),
      ).rejects.toThrow('Campus não pertence à organização atual');

      expect(prisma.person.update).not.toHaveBeenCalled();
    });

    it('rejects a user without directory-management permission', async () => {
      const prisma = {
        user: {
          findFirst: jest.fn().mockResolvedValue(null),
        },
        person: {
          findFirst: jest.fn(),
          update: jest.fn(),
        },
      };
      const personService = new PersonService(prisma as unknown as PrismaService);

      await expect(
        personService.update('person-id', { nome: 'Pessoa Atualizada' }, context),
      ).rejects.toThrow('Somente administradores e secretários podem gerenciar cadastros de pessoas');

      expect(prisma.person.findFirst).not.toHaveBeenCalled();
      expect(prisma.person.update).not.toHaveBeenCalled();
    });
  });
});
