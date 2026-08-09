import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventStatus, EventType, NotificationAudience, WorshipOrderStatus, WorshipRepertoireStatus } from '../../generated/prisma/client';
import { OrganizationContext } from '../../common/context/organization-context';
import { PrismaService } from '../../database/prisma.service';
import { CreateWorshipOrderDto } from './dto/create-worship-order.dto';
import { CreateWorshipOrderFromTemplateDto } from './dto/create-worship-order-from-template.dto';
import { CreateWorshipOrderItemDto } from './dto/create-worship-order-item.dto';
import { CreateWorshipOrderMaterialDto } from './dto/create-worship-order-material.dto';
import { CreateWorshipServiceDemandDto } from './dto/create-worship-service-demand.dto';
import { SendWorshipOrderAlertDto } from './dto/send-worship-order-alert.dto';
import { hasAnyUserRole } from '../../common/access/user-role.util';
import { ReorderWorshipOrderItemsDto } from './dto/reorder-worship-order-items.dto';
import { UpdateWorshipOrderItemDto } from './dto/update-worship-order-item.dto';
import { WorshipOrderTemplateService } from '../worship-order-template/worship-order-template.service';
import { WorshipOrderPdfService } from './worship-order-pdf.service';

@Injectable()
export class WorshipOrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly templates: WorshipOrderTemplateService,
    private readonly pdf: WorshipOrderPdfService,
  ) {}

  async create(dto: CreateWorshipOrderDto, context: OrganizationContext) {
    const event = await this.event(dto.eventId, context);
    await this.assertManage(event, context);

    const existing = await this.prisma.worshipOrder.findUnique({ where: { eventId: event.id } });
    if (existing) throw new BadRequestException('Este culto jÃ¡ possui uma ordem de culto');

    return this.prisma.worshipOrder.create({
      data: { eventId: event.id, createdByUserId: context.userId },
      include: this.details,
    });
  }

  async createFromTemplate(dto: CreateWorshipOrderFromTemplateDto, context: OrganizationContext) {
    const event = await this.event(dto.eventId, context);
    await this.assertManage(event, context);
    const existing = await this.prisma.worshipOrder.findUnique({ where: { eventId: event.id } });
    if (existing) throw new BadRequestException('Este culto já possui uma ordem de culto');

    const template = await this.templates.findForApplication(dto.templateId, context);
    const missingAreaItem = template.items.find(item => item.serviceAreaId && !event.serviceAreas.some(area => area.serviceAreaId === item.serviceAreaId));
    if (missingAreaItem) {
      throw new BadRequestException(`O culto precisa envolver a área de serviço do item "${missingAreaItem.titulo}" antes de aplicar o modelo`);
    }

    return this.prisma.worshipOrder.create({
      data: {
        eventId: event.id,
        createdByUserId: context.userId,
        templateId: template.id,
        items: {
          create: template.items.map(item => ({
            sequencia: item.sequencia,
            titulo: item.titulo,
            horario: item.horario,
            observacoes: item.observacoes,
            serviceAreaId: item.serviceAreaId,
          })),
        },
      },
      include: this.details,
    });
  }

  async findOne(id: string, context: OrganizationContext) {
    return this.order(id, context);
  }

  async findByEvent(eventId: string, context: OrganizationContext) {
    const order = await this.prisma.worshipOrder.findFirst({
      where: { eventId, event: { organizationId: context.organizationId, type: EventType.WORSHIP } },
      include: this.details,
    });
    if (!order) throw new NotFoundException('Ordem de culto nÃ£o encontrada para este culto');
    return order;
  }

  async addItem(orderId: string, dto: CreateWorshipOrderItemDto, context: OrganizationContext) {
    const order = await this.order(orderId, context);
    await this.assertManage(order.event, context);
    this.assertDraft(order);

    if (dto.responsiblePersonId) await this.person(dto.responsiblePersonId, context);
    if (dto.serviceAreaId) await this.eventArea(dto.serviceAreaId, order.event, context);

    const duplicate = await this.prisma.worshipOrderItem.findFirst({
      where: { orderId, sequencia: dto.sequencia },
    });
    if (duplicate) throw new BadRequestException('JÃ¡ existe um item nesta posiÃ§Ã£o da ordem de culto');

    return this.prisma.worshipOrderItem.create({
      data: { ...dto, orderId },
      include: this.itemDetails,
    });
  }

  async updateItem(itemId: string, dto: UpdateWorshipOrderItemDto, context: OrganizationContext) {
    const item = await this.item(itemId, context);
    await this.assertManage(item.order.event, context);
    this.assertDraft(item.order);

    if (dto.responsiblePersonId) await this.person(dto.responsiblePersonId, context);
    if (dto.serviceAreaId) await this.eventArea(dto.serviceAreaId, item.order.event, context);

    return this.prisma.worshipOrderItem.update({
      where: { id: itemId },
      data: dto,
      include: this.itemDetails,
    });
  }

  async deleteItem(itemId: string, context: OrganizationContext) {
    const item = await this.item(itemId, context);
    await this.assertManage(item.order.event, context);
    this.assertDraft(item.order);

    return this.prisma.$transaction(async tx => {
      await tx.worshipServiceDemand.deleteMany({ where: { itemId } });
      await tx.worshipOrderMaterial.deleteMany({ where: { itemId } });
      return tx.worshipOrderItem.delete({ where: { id: itemId } });
    });
  }

  async reorderItems(orderId: string, dto: ReorderWorshipOrderItemsDto, context: OrganizationContext) {
    const order = await this.order(orderId, context);
    await this.assertManage(order.event, context);
    this.assertDraft(order);

    const existing = await this.prisma.worshipOrderItem.findMany({ where: { orderId }, select: { id: true, sequencia: true } });
    const existingIds = new Set(existing.map(item => item.id));
    const requestedIds = new Set(dto.items.map(item => item.id));
    const sequences = new Set(dto.items.map(item => item.sequencia));
    if (existing.length !== dto.items.length || requestedIds.size !== dto.items.length || sequences.size !== dto.items.length || [...requestedIds].some(id => !existingIds.has(id))) {
      throw new BadRequestException('A reordenação deve informar todos os itens da ordem, sem repetições');
    }

    const offset = Math.max(0, ...existing.map(item => item.sequencia), ...dto.items.map(item => item.sequencia)) + existing.length + 1;
    await this.prisma.$transaction(async tx => {
      for (const item of existing) {
        await tx.worshipOrderItem.update({ where: { id: item.id }, data: { sequencia: item.sequencia + offset } });
      }
      for (const item of dto.items) {
        await tx.worshipOrderItem.update({ where: { id: item.id }, data: { sequencia: item.sequencia } });
      }
    });
    return this.order(orderId, context);
  }

  async addMaterial(itemId: string, dto: CreateWorshipOrderMaterialDto, context: OrganizationContext) {
    const item = await this.item(itemId, context);
    await this.assertManage(item.order.event, context);
    this.assertDraft(item.order);
    return this.prisma.worshipOrderMaterial.create({ data: { ...dto, itemId } });
  }

  async addDemand(itemId: string, dto: CreateWorshipServiceDemandDto, context: OrganizationContext) {
    const item = await this.item(itemId, context);
    await this.assertManage(item.order.event, context);
    this.assertDraft(item.order);
    await this.eventArea(dto.serviceAreaId, item.order.event, context);

    if (dto.responsiblePersonId) {
      await this.person(dto.responsiblePersonId, context);
      const membership = await this.prisma.serviceMembership.findFirst({
        where: { personId: dto.responsiblePersonId, serviceAreaId: dto.serviceAreaId, ativo: true },
      });
      if (!membership) throw new BadRequestException('O responsÃ¡vel precisa ter vÃ­nculo ativo com a Ã¡rea de serviÃ§o da demanda');
    }

    const demand = await this.prisma.worshipServiceDemand.create({
      data: { ...dto, dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined, itemId },
      include: { serviceArea: true, responsiblePerson: true, item: { select: { id: true, titulo: true, orderId: true } } },
    });
    await this.notifyArea(dto.serviceAreaId, item.order.event, context, 'Nova demanda na Ordem de Culto', `A área recebeu a demanda "${dto.descricao}" no item "${item.titulo}".`);
    return demand;
  }

  async publish(id: string, context: OrganizationContext) {
    const order = await this.order(id, context);
    await this.assertManage(order.event, context);
    this.assertDraft(order);
    if (!order.items.length) throw new BadRequestException('Inclua ao menos um item antes de publicar a ordem de culto');

    const published = await this.prisma.worshipOrder.update({
      where: { id },
      data: { status: WorshipOrderStatus.PUBLISHED },
      include: this.details,
    });
    await Promise.all(published.event.serviceAreas.map(area => this.notifyArea(area.serviceAreaId, published.event, context, 'Ordem de Culto publicada', `A ordem do culto "${published.event.titulo}" foi publicada.`)));
    return published;
  }

  async sendAlert(id: string, dto: SendWorshipOrderAlertDto, context: OrganizationContext) {
    const order = await this.order(id, context);
    await this.assertManage(order.event, context);
    this.assertPublished(order);
    const recipientIds = await this.alertRecipients(order, context);
    if (!recipientIds.length) throw new BadRequestException('Não há participantes ativos para receber o alerta deste culto');

    return this.prisma.notification.create({
      data: {
        titulo: dto.titulo,
        mensagem: dto.mensagem,
        audience: NotificationAudience.PERSON,
        organizationId: context.organizationId,
        eventId: order.event.id,
        recipients: { create: recipientIds.map(personId => ({ personId })) },
      },
      include: { recipients: { include: { person: true } } },
    });
  }

  async generatePdf(id: string, context: OrganizationContext) {
    const order = await this.order(id, context);
    await this.assertManage(order.event, context);
    this.assertPublished(order);
    return this.pdf.render(order);
  }

  async completeDemand(id: string, context: OrganizationContext) {
    const demand = await this.prisma.worshipServiceDemand.findFirst({
      where: { id, item: { order: { event: { organizationId: context.organizationId } } } },
      include: { repertoireDelivery: true, item: { include: { order: { include: { event: true } } } } },
    });
    if (!demand) throw new NotFoundException('Demanda da ordem de culto nÃ£o encontrada');
    if (demand.status !== 'PENDING') throw new BadRequestException('Somente demandas pendentes podem ser concluÃ­das');

    const isResponsible = demand.responsiblePersonId === context.personId;
    if (!isResponsible) {
      try {
        await this.assertManage(demand.item.order.event, context);
      } catch (error) {
        if (!(error instanceof ForbiddenException)) throw error;
        const member = await this.prisma.serviceMembership.findFirst({
          where: { personId: context.personId, serviceAreaId: demand.serviceAreaId, ativo: true },
        });
        if (!member) throw error;
      }
    }

    const completed = await this.prisma.worshipServiceDemand.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
      include: { serviceArea: true, responsiblePerson: true, item: { select: { id: true, titulo: true, orderId: true } } },
    });
    if (demand.repertoireDelivery) {
      await this.prisma.worshipRepertoire.update({
        where: { id: demand.repertoireDelivery.id },
        data: { status: WorshipRepertoireStatus.COMPLETED, completedAt: new Date() },
      });
    }
    return completed;
  }

  async cancelDemand(id: string, context: OrganizationContext) {
    const demand = await this.prisma.worshipServiceDemand.findFirst({
      where: { id, item: { order: { event: { organizationId: context.organizationId } } } },
      include: { repertoireDelivery: true, item: { include: { order: { include: { event: true } } } } },
    });
    if (!demand) throw new NotFoundException('Demanda da ordem de culto não encontrada');
    if (demand.status !== 'PENDING') throw new BadRequestException('Somente demandas pendentes podem ser canceladas');
    await this.assertManage(demand.item.order.event, context);

    const cancelled = await this.prisma.worshipServiceDemand.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { serviceArea: true, responsiblePerson: true, item: { select: { id: true, titulo: true, orderId: true } } },
    });
    if (demand.repertoireDelivery) {
      await this.prisma.worshipRepertoire.update({
        where: { id: demand.repertoireDelivery.id },
        data: { status: WorshipRepertoireStatus.APPROVED, sentToWorshipOrderAt: null, deliveryDemandId: null },
      });
    }
    return cancelled;
  }

  private async notifyArea(serviceAreaId: string, event: { id: string; titulo: string }, context: OrganizationContext, titulo: string, mensagem: string) {
    const recipients = await this.prisma.serviceMembership.findMany({
      where: { serviceAreaId, ativo: true, serviceArea: { organizationId: context.organizationId } },
      select: { personId: true },
      distinct: ['personId'],
    });
    if (!recipients.length) return;
    await this.prisma.notification.create({
      data: {
        titulo,
        mensagem,
        audience: NotificationAudience.SERVICE_AREA,
        organizationId: context.organizationId,
        eventId: event.id,
        serviceAreaId,
        recipients: { create: recipients.map(recipient => ({ personId: recipient.personId })) },
      },
    });
  }

  private async alertRecipients(order: {
    event: {
      id: string;
      responsiblePersonId: string | null;
      serviceAreas: { serviceAreaId: string }[];
      schedules: { personId: string }[];
    };
    items: { responsiblePersonId: string | null; demands: { responsiblePersonId: string | null }[] }[];
  }, context: OrganizationContext) {
    const areaIds = order.event.serviceAreas.map(area => area.serviceAreaId);
    const areaMembers = areaIds.length
      ? await this.prisma.serviceMembership.findMany({
        where: { serviceAreaId: { in: areaIds }, ativo: true, serviceArea: { organizationId: context.organizationId } },
        select: { personId: true },
        distinct: ['personId'],
      })
      : [];
    const candidateIds = new Set([
      order.event.responsiblePersonId,
      ...areaMembers.map(member => member.personId),
      ...order.event.schedules.map(schedule => schedule.personId),
      ...order.items.map(item => item.responsiblePersonId),
      ...order.items.flatMap(item => item.demands.map(demand => demand.responsiblePersonId)),
    ].filter((id): id is string => Boolean(id)));
    if (!candidateIds.size) return [];
    const activePeople = await this.prisma.person.findMany({
      where: { id: { in: [...candidateIds] }, organizationId: context.organizationId, ativo: true },
      select: { id: true },
    });
    return activePeople.map(person => person.id);
  }

  private async order(id: string, context: OrganizationContext) {
    const order = await this.prisma.worshipOrder.findFirst({
      where: { id, event: { organizationId: context.organizationId } },
      include: this.details,
    });
    if (!order) throw new NotFoundException('Ordem de culto nÃ£o encontrada na organizaÃ§Ã£o atual');
    return order;
  }

  private async item(id: string, context: OrganizationContext) {
    const item = await this.prisma.worshipOrderItem.findFirst({
      where: { id, order: { event: { organizationId: context.organizationId } } },
      include: { order: { include: { event: { include: { serviceAreas: true } } } } },
    });
    if (!item) throw new NotFoundException('Item da ordem de culto nÃ£o encontrado');
    return item;
  }

  private async event(id: string, context: OrganizationContext) {
    const event = await this.prisma.event.findFirst({
      where: { id, organizationId: context.organizationId, type: EventType.WORSHIP, status: EventStatus.APPROVED },
      include: { serviceAreas: true },
    });
    if (!event) throw new NotFoundException('Culto aprovado nÃ£o encontrado na organizaÃ§Ã£o atual');
    return event;
  }

  private async person(id: string, context: OrganizationContext) {
    const person = await this.prisma.person.findFirst({
      where: { id, organizationId: context.organizationId, ativo: true },
    });
    if (!person) throw new NotFoundException('Pessoa ativa nÃ£o encontrada na organizaÃ§Ã£o atual');
    return person;
  }

  private async eventArea(serviceAreaId: string, event: { campusId: string; serviceAreas: { serviceAreaId: string }[] }, context: OrganizationContext) {
    if (!event.serviceAreas.some(area => area.serviceAreaId === serviceAreaId)) {
      throw new BadRequestException('A Ã¡rea de serviÃ§o precisa estar envolvida no culto para receber itens ou demandas');
    }
    const area = await this.prisma.serviceArea.findFirst({
      where: { id: serviceAreaId, organizationId: context.organizationId, ativo: true, OR: [{ scope: 'GLOBAL' }, { campusId: event.campusId }] },
    });
    if (!area) throw new BadRequestException('Ãrea de serviÃ§o invÃ¡lida para o campus deste culto');
    return area;
  }

  private async assertManage(event: { createdByUserId: string; responsiblePersonId: string | null }, context: OrganizationContext) {
    const user = await this.prisma.user.findFirst({
      where: { id: context.userId, organizationId: context.organizationId, ativo: true },
      include: { additionalRoles: { select: { role: true } } },
    });
    if (!user) throw new ForbiddenException('UsuÃ¡rio sem vÃ­nculo organizacional ativo');
    if (hasAnyUserRole(user, ['SECRETARY', 'WORSHIP_ORDER_MANAGER', 'ADMIN', 'SUPER_ADMIN', 'PASTOR'])) return;
    if (event.createdByUserId === context.userId || event.responsiblePersonId === context.personId) return;
    throw new ForbiddenException('Somente secretaria, administraÃ§Ã£o, pastoral ou a lideranÃ§a responsÃ¡vel pelo culto pode montar a ordem');
  }

  private assertDraft(order: { status: WorshipOrderStatus }) {
    if (order.status !== WorshipOrderStatus.DRAFT) {
      throw new BadRequestException('A ordem de culto publicada nÃ£o pode mais ser alterada');
    }
  }

  private assertPublished(order: { status: WorshipOrderStatus }) {
    if (order.status !== WorshipOrderStatus.PUBLISHED) {
      throw new BadRequestException('Publique a ordem de culto antes de enviar alertas ou gerar o PDF');
    }
  }

  private readonly itemDetails = {
    responsiblePerson: true,
    serviceArea: true,
    materials: true,
    demands: { include: { serviceArea: true, responsiblePerson: true } },
  } as const;

  private readonly details = {
    event: { include: { campus: true, serviceAreas: { include: { serviceArea: true } }, schedules: { include: { person: true, team: { include: { serviceArea: true } } }, orderBy: { data: 'asc' as const } } } },
    createdByUser: { select: { id: true, loginEmail: true } },
    template: { select: { id: true, nome: true, padrao: true } },
    items: { include: this.itemDetails, orderBy: { sequencia: 'asc' as const } },
  } as const;
}
