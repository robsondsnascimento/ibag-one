import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventStatus, EventType, WorshipOrderStatus } from '../../generated/prisma/client';
import { OrganizationContext } from '../../common/context/organization-context';
import { PrismaService } from '../../database/prisma.service';
import { CreateWorshipOrderDto } from './dto/create-worship-order.dto';
import { CreateWorshipOrderItemDto } from './dto/create-worship-order-item.dto';
import { CreateWorshipOrderMaterialDto } from './dto/create-worship-order-material.dto';
import { CreateWorshipServiceDemandDto } from './dto/create-worship-service-demand.dto';

@Injectable()
export class WorshipOrderService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.worshipServiceDemand.create({
      data: { ...dto, dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined, itemId },
      include: { serviceArea: true, responsiblePerson: true, item: { select: { id: true, titulo: true, orderId: true } } },
    });
  }

  async publish(id: string, context: OrganizationContext) {
    const order = await this.order(id, context);
    await this.assertManage(order.event, context);
    this.assertDraft(order);
    if (!order.items.length) throw new BadRequestException('Inclua ao menos um item antes de publicar a ordem de culto');

    return this.prisma.worshipOrder.update({
      where: { id },
      data: { status: WorshipOrderStatus.PUBLISHED },
      include: this.details,
    });
  }

  async completeDemand(id: string, context: OrganizationContext) {
    const demand = await this.prisma.worshipServiceDemand.findFirst({
      where: { id, item: { order: { event: { organizationId: context.organizationId } } } },
      include: { item: { include: { order: { include: { event: true } } } } },
    });
    if (!demand) throw new NotFoundException('Demanda da ordem de culto nÃ£o encontrada');
    if (demand.status !== 'PENDING') throw new BadRequestException('Somente demandas pendentes podem ser concluÃ­das');

    const isResponsible = demand.responsiblePersonId === context.personId;
    if (!isResponsible) await this.assertManage(demand.item.order.event, context);

    return this.prisma.worshipServiceDemand.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
      include: { serviceArea: true, responsiblePerson: true, item: { select: { id: true, titulo: true, orderId: true } } },
    });
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
    });
    if (!user) throw new ForbiddenException('UsuÃ¡rio sem vÃ­nculo organizacional ativo');
    if (['SECRETARY', 'WORSHIP_ORDER_MANAGER', 'ADMIN', 'SUPER_ADMIN', 'PASTOR'].includes(user.role)) return;
    if (event.createdByUserId === context.userId || event.responsiblePersonId === context.personId) return;
    throw new ForbiddenException('Somente secretaria, administraÃ§Ã£o, pastoral ou a lideranÃ§a responsÃ¡vel pelo culto pode montar a ordem');
  }

  private assertDraft(order: { status: WorshipOrderStatus }) {
    if (order.status !== WorshipOrderStatus.DRAFT) {
      throw new BadRequestException('A ordem de culto publicada nÃ£o pode mais ser alterada');
    }
  }

  private readonly itemDetails = {
    responsiblePerson: true,
    serviceArea: true,
    materials: true,
    demands: { include: { serviceArea: true, responsiblePerson: true } },
  } as const;

  private readonly details = {
    event: { include: { campus: true, serviceAreas: { include: { serviceArea: true } } } },
    createdByUser: { select: { id: true, loginEmail: true } },
    items: { include: this.itemDetails, orderBy: { sequencia: 'asc' as const } },
  } as const;
}
