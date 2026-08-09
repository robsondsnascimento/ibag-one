import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationContext } from '../../common/context/organization-context';
import { hasAnyUserRole } from '../../common/access/user-role.util';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateWorshipOrderTemplateDto,
  CreateWorshipOrderTemplateItemDto,
  ReorderWorshipOrderTemplateItemsDto,
  UpdateWorshipOrderTemplateDto,
  UpdateWorshipOrderTemplateItemDto,
} from './dto';

@Injectable()
export class WorshipOrderTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorshipOrderTemplateDto, context: OrganizationContext) {
    await this.assertManage(context);
    this.assertUniqueSequences(dto.items);
    await Promise.all(dto.items.filter(item => item.serviceAreaId).map(item => this.templateArea(item.serviceAreaId!, context)));

    return this.prisma.$transaction(async tx => {
      if (dto.padrao) {
        await tx.worshipOrderTemplate.updateMany({
          where: { organizationId: context.organizationId, padrao: true },
          data: { padrao: false },
        });
      }
      return tx.worshipOrderTemplate.create({
        data: {
          nome: dto.nome,
          padrao: dto.padrao ?? false,
          organizationId: context.organizationId,
          createdByUserId: context.userId,
          items: { create: dto.items },
        },
        include: this.details,
      });
    });
  }

  async findAll(context: OrganizationContext) {
    return this.prisma.worshipOrderTemplate.findMany({
      where: { organizationId: context.organizationId },
      include: this.details,
      orderBy: [{ padrao: 'desc' }, { nome: 'asc' }],
    });
  }

  async findOne(id: string, context: OrganizationContext) {
    return this.template(id, context);
  }

  async update(id: string, dto: UpdateWorshipOrderTemplateDto, context: OrganizationContext) {
    await this.assertManage(context);
    const template = await this.template(id, context);
    const ativo = dto.ativo ?? template.ativo;
    const padrao = dto.padrao ?? template.padrao;
    if (padrao && !ativo) throw new BadRequestException('Um modelo padrão precisa permanecer ativo');

    return this.prisma.$transaction(async tx => {
      if (padrao) {
        await tx.worshipOrderTemplate.updateMany({
          where: { organizationId: context.organizationId, padrao: true, id: { not: id } },
          data: { padrao: false },
        });
      }
      return tx.worshipOrderTemplate.update({
        where: { id },
        data: { ...dto, ativo, padrao: ativo ? padrao : false },
        include: this.details,
      });
    });
  }

  async addItem(templateId: string, dto: CreateWorshipOrderTemplateItemDto, context: OrganizationContext) {
    await this.assertManage(context);
    await this.template(templateId, context);
    if (dto.serviceAreaId) await this.templateArea(dto.serviceAreaId, context);
    const duplicate = await this.prisma.worshipOrderTemplateItem.findFirst({ where: { templateId, sequencia: dto.sequencia } });
    if (duplicate) throw new BadRequestException('Já existe um item nesta posição do modelo');
    return this.prisma.worshipOrderTemplateItem.create({ data: { ...dto, templateId }, include: { serviceArea: true } });
  }

  async updateItem(itemId: string, dto: UpdateWorshipOrderTemplateItemDto, context: OrganizationContext) {
    await this.assertManage(context);
    const item = await this.item(itemId, context);
    if (dto.serviceAreaId) await this.templateArea(dto.serviceAreaId, context);
    return this.prisma.worshipOrderTemplateItem.update({ where: { id: item.id }, data: dto, include: { serviceArea: true } });
  }

  async deleteItem(itemId: string, context: OrganizationContext) {
    await this.assertManage(context);
    const item = await this.prisma.worshipOrderTemplateItem.findFirst({
      where: { id: itemId, template: { organizationId: context.organizationId } },
      include: { template: { select: { _count: { select: { items: true } } } } },
    });
    if (!item) throw new NotFoundException('Item do modelo de ordem de culto não encontrado');
    if (item.template._count.items <= 1) throw new BadRequestException('O modelo precisa manter ao menos um item');
    return this.prisma.worshipOrderTemplateItem.delete({ where: { id: item.id } });
  }

  async reorderItems(templateId: string, dto: ReorderWorshipOrderTemplateItemsDto, context: OrganizationContext) {
    await this.assertManage(context);
    await this.template(templateId, context);
    const existing = await this.prisma.worshipOrderTemplateItem.findMany({ where: { templateId }, select: { id: true, sequencia: true } });
    const existingIds = new Set(existing.map(item => item.id));
    const requestedIds = new Set(dto.items.map(item => item.id));
    const sequences = new Set(dto.items.map(item => item.sequencia));
    if (existing.length !== dto.items.length || requestedIds.size !== dto.items.length || sequences.size !== dto.items.length || [...requestedIds].some(id => !existingIds.has(id))) {
      throw new BadRequestException('A reordenação deve informar todos os itens do modelo, sem repetições');
    }

    const offset = Math.max(0, ...existing.map(item => item.sequencia), ...dto.items.map(item => item.sequencia)) + existing.length + 1;
    await this.prisma.$transaction(async tx => {
      for (const item of existing) {
        await tx.worshipOrderTemplateItem.update({ where: { id: item.id }, data: { sequencia: item.sequencia + offset } });
      }
      for (const item of dto.items) {
        await tx.worshipOrderTemplateItem.update({ where: { id: item.id }, data: { sequencia: item.sequencia } });
      }
    });
    return this.template(templateId, context);
  }

  async findForApplication(templateId: string | undefined, context: OrganizationContext) {
    const template = await this.prisma.worshipOrderTemplate.findFirst({
      where: {
        organizationId: context.organizationId,
        ativo: true,
        ...(templateId ? { id: templateId } : { padrao: true }),
      },
      include: this.details,
    });
    if (!template) {
      throw new NotFoundException(templateId ? 'Modelo de ordem de culto ativo não encontrado' : 'Nenhum modelo padrão de ordem de culto está ativo');
    }
    return template;
  }

  private async template(id: string, context: OrganizationContext) {
    const template = await this.prisma.worshipOrderTemplate.findFirst({
      where: { id, organizationId: context.organizationId },
      include: this.details,
    });
    if (!template) throw new NotFoundException('Modelo de ordem de culto não encontrado na organização atual');
    return template;
  }

  private async item(id: string, context: OrganizationContext) {
    const item = await this.prisma.worshipOrderTemplateItem.findFirst({
      where: { id, template: { organizationId: context.organizationId } },
      include: { serviceArea: true },
    });
    if (!item) throw new NotFoundException('Item do modelo de ordem de culto não encontrado');
    return item;
  }

  private async templateArea(id: string, context: OrganizationContext) {
    const area = await this.prisma.serviceArea.findFirst({
      where: { id, organizationId: context.organizationId, ativo: true, scope: 'GLOBAL' },
    });
    if (!area) throw new BadRequestException('O modelo padrão só pode usar áreas globais ativas da organização');
    return area;
  }

  private async assertManage(context: OrganizationContext) {
    const user = await this.prisma.user.findFirst({
      where: { id: context.userId, organizationId: context.organizationId, ativo: true },
      include: { additionalRoles: { select: { role: true } } },
    });
    if (!hasAnyUserRole(user, ['SECRETARY', 'WORSHIP_ORDER_MANAGER', 'ADMIN', 'SUPER_ADMIN', 'PASTOR_SENIOR'])) {
      throw new ForbiddenException('Somente a liderança central autorizada pode gerenciar modelos de ordem de culto');
    }
  }

  private assertUniqueSequences(items: CreateWorshipOrderTemplateItemDto[]) {
    if (new Set(items.map(item => item.sequencia)).size !== items.length) {
      throw new BadRequestException('Os itens do modelo precisam ter sequências únicas');
    }
  }

  private readonly details = {
    createdByUser: { select: { id: true, loginEmail: true } },
    items: { include: { serviceArea: true }, orderBy: { sequencia: 'asc' as const } },
  } as const;
}
