import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  check() {
    return {
      status: 'ok',
      service: 'IBAG One API',
      codename: 'Project Nehemiah',
      version: '0.1.0',
    };
  }

  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ...this.check(), database: 'ok' };
    } catch {
      throw new ServiceUnavailableException('Banco de dados indisponível');
    }
  }
}
