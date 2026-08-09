import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { CellNetworkSupervisionService } from './cell-network-supervision.service';


describe('CellNetworkSupervisionService', () => {

  const context = {
    userId: 'user-id',
    personId: 'authenticated-person-id',
    organizationId: 'organization-id',
  };

  const dto = {
    personId: 'person-id',
    networkId: 'network-id',
  };

  const prisma = {
    user: {
      findFirst: jest.fn(),
    },
    person: {
      findFirst: jest.fn(),
    },
    cellNetwork: {
      findFirst: jest.fn(),
    },
    cellNetworkSupervision: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    cellCampusCoordination: {
      findMany: jest.fn(),
    },
  };

  let service: CellNetworkSupervisionService;


  beforeEach(() => {
    jest.clearAllMocks();

    service = new CellNetworkSupervisionService(prisma as never);
  });


  it('rejects a supervisor outside the current organization', async () => {
    prisma.person.findFirst.mockResolvedValue(null);

    await expect(service.create(dto, context))
      .rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.cellNetwork.findFirst).not.toHaveBeenCalled();
  });


  it('rejects assigning a second active supervisor to a network', async () => {
    prisma.person.findFirst.mockResolvedValue({ id: dto.personId });
    prisma.cellNetwork.findFirst.mockResolvedValue({ id: dto.networkId, campusId: 'campus-id' });
    prisma.user.findFirst.mockResolvedValue({ id: context.userId, person: { campusId: 'campus-id' }, role: 'ADMIN' });
    prisma.cellNetworkSupervision.findFirst.mockResolvedValue({
      id: 'existing-supervision-id',
    });

    await expect(service.create(dto, context))
      .rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.cellNetworkSupervision.create).not.toHaveBeenCalled();
    expect(prisma.cellNetworkSupervision.findFirst).toHaveBeenCalledWith({
      where: {
        networkId: dto.networkId,
        ativo: true,
      },
    });
  });


  it('creates the first active supervisor for a network', async () => {
    const supervision = { id: 'supervision-id' };

    prisma.person.findFirst.mockResolvedValue({ id: dto.personId });
    prisma.cellNetwork.findFirst.mockResolvedValue({ id: dto.networkId, campusId: 'campus-id' });
    prisma.user.findFirst.mockResolvedValue({ id: context.userId, person: { campusId: 'campus-id' }, role: 'ADMIN' });
    prisma.cellNetworkSupervision.findFirst.mockResolvedValue(null);
    prisma.cellNetworkSupervision.create.mockResolvedValue(supervision);

    await expect(service.create(dto, context))
      .resolves.toEqual(supervision);

    expect(prisma.cellNetworkSupervision.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          personId: dto.personId,
          networkId: dto.networkId,
          ativo: true,
        }),
      }),
    );
  });

  it('allows a coordinator to manage supervision only in a coordinated campus', async () => {
    prisma.person.findFirst.mockResolvedValue({ id: dto.personId });
    prisma.cellNetwork.findFirst.mockResolvedValue({ id: dto.networkId, campusId: 'campus-id' });
    prisma.user.findFirst.mockResolvedValue({ id: context.userId, person: { campusId: 'another-campus-id' }, role: 'MEMBER' });
    prisma.cellCampusCoordination.findMany.mockResolvedValue([{ campusId: 'campus-id' }]);
    prisma.cellNetworkSupervision.findFirst.mockResolvedValue(null);
    prisma.cellNetworkSupervision.create.mockResolvedValue({ id: 'supervision-id' });

    await expect(service.create(dto, context)).resolves.toEqual({ id: 'supervision-id' });
  });

});
