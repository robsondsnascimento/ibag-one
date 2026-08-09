import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { mergeMap, Observable } from 'rxjs';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const request = context.switchToHttp().getRequest<Request & { user?: { userId?: string; organizationId?: string } }>();
    const response = context.switchToHttp().getResponse<Response>();
    const method = request.method.toUpperCase();
    const actor = request.user;

    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) || !actor?.userId || !actor.organizationId) {
      return next.handle();
    }

    return next.handle().pipe(
      mergeMap(async result => {
        await this.auditService.record({
          action: method,
          resource: request.originalUrl.split('?')[0],
          entityId: result && typeof result === 'object' && 'id' in result && typeof result.id === 'string' ? result.id : undefined,
          organizationId: actor.organizationId!,
          actorUserId: actor.userId!,
          statusCode: response.statusCode,
        });
        return result;
      }),
    );
  }
}
