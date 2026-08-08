import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { CellNetworkService } from './cell-network.service';


describe('CellNetworkService', () => {

  const context = {
    userId: 'user-id',
    personId: 'authenticated-person-id',
    organizationId: 'organization-id',
  };

  const prisma = {
    campus: {
      findFirst: jest.fn(),
    },
    cell: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    cellNetwork: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: CellNetworkService;


  beforeEach(() => {
    jest.clearAllMocks();

    service = new CellNetworkService(prisma as never);
  });


  it('rejects a network creation outside the current organization', async () => {
    prisma.campus.findFirst.mockResolvedValue(null);

    await expect(service.create({
      nome: 'Rede Norte',
      campusId: 'campus-id',
    }, context)).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.campus.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'campus-id',
        organizationId: context.organizationId,
      },
    });
  });


  it('rejects linking a cell from a different campus', async () => {
    prisma.cellNetwork.findFirst.mockResolvedValue({
      id: 'network-id',
      campusId: 'network-campus-id',
      ativo: true,
      cells: [],
    });
    prisma.cell.findFirst.mockResolvedValue({
      id: 'cell-id',
      campusId: 'another-campus-id',
    });

    await expect(service.assignCell(
      'network-id',
      'cell-id',
      context,
    )).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.cell.update).not.toHaveBeenCalled();
  });


  it('links a cell from the same campus to an active network', async () => {
    const cell = { id: 'cell-id', networkId: 'network-id' };

    prisma.cellNetwork.findFirst.mockResolvedValue({
      id: 'network-id',
      campusId: 'campus-id',
      ativo: true,
      cells: [],
    });
    prisma.cell.findFirst.mockResolvedValue({
      id: 'cell-id',
      campusId: 'campus-id',
    });
    prisma.cell.update.mockResolvedValue(cell);

    await expect(service.assignCell(
      'network-id',
      'cell-id',
      context,
    )).resolves.toEqual(cell);

    expect(prisma.cell.update).toHaveBeenCalledWith({
      where: {
        id: 'cell-id',
      },
      data: {
        networkId: 'network-id',
      },
      include: {
        campus: true,
        network: true,
      },
    });
  });

});
