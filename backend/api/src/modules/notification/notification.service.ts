import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { hasAnyUserRole, hasPastoralCampusAccess } from '../../common/access/user-role.util';
import { OrganizationContext } from '../../common/context/organization-context';
import { NotificationAudience } from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationDispatchService } from '../integrations/notification-dispatch.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dispatch?: NotificationDispatchService,
  ) {}

  async create(dto: CreateNotificationDto, context: OrganizationContext) {
    await this.validateTarget(dto, context);
    await this.authorize(dto, context);
    const recipientIds = await this.recipients(dto, context);
    if (!recipientIds.length) throw new BadRequestException('Não há destinatários ativos para esta notificação');
    const notification = await this.prisma.notification.create({
      data: {
        titulo: dto.titulo,
        mensagem: dto.mensagem,
        audience: dto.audience,
        campusId: dto.campusId,
        serviceAreaId: dto.serviceAreaId,
        serviceTeamId: dto.serviceTeamId,
        eventId: dto.eventId,
        organizationId: context.organizationId,
        recipients: { create: recipientIds.map(personId => ({ personId })) },
      },
      include: { recipients: { include: { person: true } } },
    });
    await this.dispatch?.publish({
      notificationId: notification.id,
      organizationId: context.organizationId,
      title: notification.titulo,
      message: notification.mensagem,
      recipientPersonIds: recipientIds,
      eventId: notification.eventId,
    });
    return notification;
  }

  async mine(context: OrganizationContext) {
    return this.prisma.notificationRecipient.findMany({
      where: { personId: context.personId },
      include: { notification: { include: { event: true } } },
      orderBy: { deliveredAt: 'desc' },
    });
  }

  async markRead(id: string, context: OrganizationContext) {
    const item = await this.prisma.notificationRecipient.findFirst({
      where: { id, personId: context.personId, notification: { organizationId: context.organizationId } },
    });
    if (!item) throw new NotFoundException('Notificação não encontrada');
    return this.prisma.notificationRecipient.update({ where: { id }, data: { readAt: new Date() } });
  }

  private async recipients(dto: CreateNotificationDto, context: OrganizationContext) {
    if (dto.audience === NotificationAudience.ORGANIZATION) {
      return (await this.prisma.person.findMany({ where: { organizationId: context.organizationId, ativo: true }, select: { id: true } })).map(item => item.id);
    }
    if (dto.audience === NotificationAudience.CAMPUS) {
      return (await this.prisma.person.findMany({ where: { organizationId: context.organizationId, campusId: dto.campusId!, ativo: true }, select: { id: true } })).map(item => item.id);
    }
    if (dto.audience === NotificationAudience.SERVICE_AREA) {
      return (await this.prisma.serviceMembership.findMany({ where: { serviceAreaId: dto.serviceAreaId!, ativo: true }, select: { personId: true }, distinct: ['personId'] })).map(item => item.personId);
    }
    if (dto.audience === NotificationAudience.SERVICE_TEAM) {
      return (await this.prisma.serviceMembership.findMany({ where: { teamId: dto.serviceTeamId!, ativo: true }, select: { personId: true }, distinct: ['personId'] })).map(item => item.personId);
    }
    return [dto.personId!];
  }

  private async validateTarget(dto: CreateNotificationDto, context: OrganizationContext) {
    const required: Record<NotificationAudience, keyof CreateNotificationDto | undefined> = {
      ORGANIZATION: undefined,
      CAMPUS: 'campusId',
      SERVICE_AREA: 'serviceAreaId',
      SERVICE_TEAM: 'serviceTeamId',
      PERSON: 'personId',
    };
    const field = required[dto.audience];
    if (field && !dto[field]) throw new BadRequestException('O público selecionado exige um destinatário específico');
    const checks: Promise<unknown>[] = [];
    if (dto.campusId) checks.push(this.prisma.campus.findFirst({ where: { id: dto.campusId, organizationId: context.organizationId } }));
    if (dto.serviceAreaId) checks.push(this.prisma.serviceArea.findFirst({ where: { id: dto.serviceAreaId, organizationId: context.organizationId } }));
    if (dto.serviceTeamId) checks.push(this.prisma.serviceTeam.findFirst({ where: { id: dto.serviceTeamId, organizationId: context.organizationId } }));
    if (dto.personId) checks.push(this.prisma.person.findFirst({ where: { id: dto.personId, organizationId: context.organizationId } }));
    if (dto.eventId) checks.push(this.prisma.event.findFirst({ where: { id: dto.eventId, organizationId: context.organizationId } }));
    if ((await Promise.all(checks)).some(value => value === null)) throw new NotFoundException('Público ou evento não encontrado na organização atual');
  }

  private async authorize(dto: CreateNotificationDto, context: OrganizationContext) {
    const user = await this.prisma.user.findFirst({
      where: { id: context.userId, organizationId: context.organizationId },
      include: { person: { select: { campusId: true, campusMemberships: { where: { ativo: true }, select: { campusId: true } } } }, additionalRoles: { select: { role: true } } },
    });
    if (hasAnyUserRole(user, ['SECRETARY', 'ADMIN', 'SUPER_ADMIN', 'PASTOR_SENIOR'])) return;
    if (!hasAnyUserRole(user, ['PASTOR'])) throw new ForbiddenException('Somente liderança autorizada pode enviar notificações');
    if (dto.audience === NotificationAudience.ORGANIZATION) throw new ForbiddenException('O pastor não pode enviar notificações para toda a organização');
    const campusId = await this.targetCampusId(dto, context);
    if (!campusId || !hasPastoralCampusAccess(user, campusId)) throw new ForbiddenException('O pastor só pode enviar notificações para o seu campus');
  }

  private async targetCampusId(dto: CreateNotificationDto, context: OrganizationContext) {
    if (dto.audience === NotificationAudience.CAMPUS) return dto.campusId;
    if (dto.audience === NotificationAudience.SERVICE_AREA) return (await this.prisma.serviceArea.findFirst({ where: { id: dto.serviceAreaId, organizationId: context.organizationId }, select: { campusId: true } }))?.campusId;
    if (dto.audience === NotificationAudience.SERVICE_TEAM) return (await this.prisma.serviceTeam.findFirst({ where: { id: dto.serviceTeamId, organizationId: context.organizationId }, select: { campusId: true } }))?.campusId;
    if (dto.audience === NotificationAudience.PERSON) return (await this.prisma.person.findFirst({ where: { id: dto.personId, organizationId: context.organizationId }, select: { campusId: true } }))?.campusId;
    return undefined;
  }
}
