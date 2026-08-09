import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export type CreateAuditLogInput = {
  action: string;
  resource: string;
  entityId?: string;
  organizationId: string;
  actorUserId: string;
  statusCode: number;
};

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(input: CreateAuditLogInput) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: input.action,
          resource: input.resource,
          entityId: input.entityId,
          organizationId: input.organizationId,
          actorUserId: input.actorUserId,
          metadata: { statusCode: input.statusCode },
        },
      });
    } catch (error) {
      this.logger.error('Não foi possível registrar a auditoria da operação.', error instanceof Error ? error.stack : undefined);
    }
  }
}
