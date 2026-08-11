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
        $transaction: jest.fn(async (callback) => callback(prisma)),
        user: {
          findFirst: jest.fn().mockResolvedValue({ id: 'user-id' }),
        },
        person: {
          findFirst: jest.fn().mockResolvedValue({ id: 'person-id', campusId: 'campus-id' }),
          update: jest.fn().mockResolvedValue({ id: 'person-id' }),
        },
        campus: {
          findMany: jest.fn().mockResolvedValue([{ id: 'campus-id' }]),
        },
        personCampusMembership: {
          updateMany: jest.fn(),
          upsert: jest.fn(),
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

      expect(prisma.campus.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['campus-id'] },
          organizationId: context.organizationId,
        },
        select: { id: true },
      });
      expect(prisma.personCampusMembership.upsert).toHaveBeenCalledWith(expect.objectContaining({
        where: { personId_campusId: { personId: 'person-id', campusId: 'campus-id' } },
      }));
      expect(prisma.person.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'person-id' },
        data: { nome: 'Pessoa Atualizada', campusId: 'campus-id' },
      }));
    });

    it('rejects a campus from another organization when updating', async () => {
      const prisma = {
        user: {
          findFirst: jest.fn().mockResolvedValue({ id: 'user-id' }),
        },
        person: {
          findFirst: jest.fn().mockResolvedValue({ id: 'person-id', campusId: 'campus-id' }),
          update: jest.fn(),
        },
        campus: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      };
      const personService = new PersonService(prisma as unknown as PrismaService);

      await expect(
        personService.update(
          'person-id',
          { campusId: 'foreign-campus-id' },
          context,
        ),
      ).rejects.toThrow('Um ou mais campi não pertencem à organização atual');

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

  it('creates active links for the primary and additional campuses', async () => {
    const context = {
      userId: 'user-id',
      personId: 'person-id',
      organizationId: 'organization-id',
    };
    const prisma = {
      user: { findFirst: jest.fn().mockResolvedValue({ id: 'user-id' }) },
      campus: { findMany: jest.fn().mockResolvedValue([{ id: 'campus-a' }, { id: 'campus-b' }]) },
      person: { create: jest.fn().mockResolvedValue({ id: 'person-id' }) },
    };
    const personService = new PersonService(prisma as unknown as PrismaService);

    await personService.create({
      nome: 'Pessoa em dois campi',
      campusId: 'campus-a',
      campusIds: ['campus-a', 'campus-b'],
      organizationId: context.organizationId,
    }, context);

    expect(prisma.person.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        campusId: 'campus-a',
        campusMemberships: {
          create: [
            { campusId: 'campus-a', organizationId: context.organizationId },
            { campusId: 'campus-b', organizationId: context.organizationId },
          ],
        },
      }),
    }));
  });
});
