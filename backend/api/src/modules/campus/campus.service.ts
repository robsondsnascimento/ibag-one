import { Injectable } from '@nestjs/common';
import { OrganizationContext } from '../../common/context/organization-context';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CampusService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll(context: OrganizationContext) {
    return this.prisma.campus.findMany({
      where: {
        organizationId: context.organizationId,
        ativo: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.campus.findUnique({
      where: {
        id,
      },
    });
  }

  async create(data: {
    nome: string;
    cidade: string;
    estado: string;
  }) {
    return this.prisma.campus.create({
      data: {
        nome: data.nome,
        cidade: data.cidade,
        estado: data.estado,
      },
    });
  }

  async update(
    id: string,
    data: {
      nome?: string;
      cidade?: string;
      estado?: string;
      ativo?: boolean;
    },
  ) {
    return this.prisma.campus.update({
      where: {
        id,
      },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.campus.update({
      where: {
        id,
      },
      data: {
        ativo: false,
      },
    });
  }
}
