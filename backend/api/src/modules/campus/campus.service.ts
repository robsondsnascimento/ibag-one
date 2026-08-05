import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CampusService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.campus.findMany({
      where: {
        ativo: true,
      },
    });
  }
}
