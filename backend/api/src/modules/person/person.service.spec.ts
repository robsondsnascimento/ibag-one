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

  describe('findOne', () => {
    const context = {
      userId: 'user-id',
      personId: 'person-id',
      organizationId: 'organization-id',
    };

    it('returns the person from the current organization', async () => {
      const person = { id: 'person-id', nome: 'Pessoa Teste' };
      const prisma = {
        person: {
          findFirst: jest.fn().mockResolvedValue(person),
        },
      };
      const personService = new PersonService(prisma as unknown as PrismaService);

      await expect(personService.findOne(person.id, context)).resolves.toBe(person);
      expect(prisma.person.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: person.id, organizationId: context.organizationId },
      }));
    });

    it('does not expose a person outside the current organization', async () => {
      const prisma = {
        person: {
          findFirst: jest.fn().mockResolvedValue(null),
        },
      };
      const personService = new PersonService(prisma as unknown as PrismaService);

      await expect(personService.findOne('foreign-person-id', context))
        .rejects.toThrow('Pessoa não encontrada na organização atual');
    });
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

    it('stores an IBAG entry date as a complete date-time without changing its calendar day', async () => {
      const prisma = {
        $transaction: jest.fn(async (callback) => callback(prisma)),
        user: { findFirst: jest.fn().mockResolvedValue({ id: 'user-id' }) },
        person: {
          findFirst: jest.fn().mockResolvedValue({ id: 'person-id', campusId: 'campus-id' }),
          update: jest.fn().mockResolvedValue({ id: 'person-id' }),
        },
      };
      const personService = new PersonService(prisma as unknown as PrismaService);

      await personService.update('person-id', { dataMembresia: '2019-09-04' }, context);

      expect(prisma.person.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          dataMembresia: new Date('2019-09-04T12:00:00.000Z'),
        }),
      }));
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

  it('stores ministerial titles only for a person in the current organization', async () => {
    const context = {
      userId: 'user-id',
      personId: 'person-id',
      organizationId: 'organization-id',
    };
    const prisma = {
      user: { findFirst: jest.fn().mockResolvedValue({ id: 'user-id' }) },
      person: {
        findFirst: jest.fn().mockResolvedValue({ id: 'person-id' }),
        update: jest.fn().mockResolvedValue({ id: 'person-id', titulosMinisteriais: ['Pastor de Adoração'] }),
      },
    };
    const personService = new PersonService(prisma as unknown as PrismaService);

    await expect(personService.updateMinisterialTitles('person-id', {
      titulosMinisteriais: [' Pastor de Adoração ', 'Pastor de Adoração'],
    }, context)).resolves.toEqual({ id: 'person-id', titulosMinisteriais: ['Pastor de Adoração'] });

    expect(prisma.person.findFirst).toHaveBeenCalledWith({
      where: { id: 'person-id', organizationId: context.organizationId },
      select: { id: true },
    });
    expect(prisma.person.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'person-id' },
      data: { titulosMinisteriais: ['Pastor de Adoração'] },
    }));
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

  it('allows a person to update their own profile photo', async () => {
    const context = {
      userId: 'user-id',
      personId: 'person-id',
      organizationId: 'organization-id',
    };
    const prisma = {
      user: { findFirst: jest.fn() },
      person: {
        findFirst: jest.fn().mockResolvedValue({ id: 'person-id', fotoPerfilPath: null }),
        update: jest.fn().mockResolvedValue({ id: 'person-id', fotoPerfilAtualizadaEm: new Date() }),
      },
    };
    const personService = new PersonService(prisma as unknown as PrismaService);

    await expect(personService.updateProfilePhoto('person-id', {
      filename: 'profile-image',
      path: 'uploads/profile-image',
      mimetype: 'image/png',
      size: 1024,
    }, context)).resolves.toEqual(expect.objectContaining({ id: 'person-id' }));

    expect(prisma.user.findFirst).not.toHaveBeenCalled();
    expect(prisma.person.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'person-id' },
      data: expect.objectContaining({
        fotoPerfilPath: 'profile-image',
        fotoPerfilMimeType: 'image/png',
      }),
    }));
  });
});
