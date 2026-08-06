import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    dto: CreateOrganizationDto,
  ) {

    return this.prisma.organization.create({
      data: {
        nome: dto.nome,
        dominio: dto.dominio,
      },
    });
  }


  async findAll() {

    return this.prisma.organization.findMany({
      orderBy: {
        nome: 'asc',
      },
    });
  }


  async findOne(id: string) {

    return this.prisma.organization.findUnique({
      where: {
        id,
      },
    });
  }
}
