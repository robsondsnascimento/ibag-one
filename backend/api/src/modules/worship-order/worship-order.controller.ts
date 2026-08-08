import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { OrganizationContext } from '../../common/context/organization-context';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWorshipOrderDto } from './dto/create-worship-order.dto';
import { CreateWorshipOrderItemDto } from './dto/create-worship-order-item.dto';
import { CreateWorshipOrderMaterialDto } from './dto/create-worship-order-material.dto';
import { CreateWorshipServiceDemandDto } from './dto/create-worship-service-demand.dto';
import { ReorderWorshipOrderItemsDto } from './dto/reorder-worship-order-items.dto';
import { UpdateWorshipOrderItemDto } from './dto/update-worship-order-item.dto';
import { WorshipOrderService } from './worship-order.service';

@Controller('worship-orders')
@UseGuards(JwtAuthGuard)
export class WorshipOrderController {
  constructor(private readonly service: WorshipOrderService) {}

  @Post()
  create(@Body() dto: CreateWorshipOrderDto, @CurrentOrganization() context: OrganizationContext) {
    return this.service.create(dto, context);
  }

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string, @CurrentOrganization() context: OrganizationContext) {
    return this.service.findByEvent(eventId, context);
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() dto: CreateWorshipOrderItemDto, @CurrentOrganization() context: OrganizationContext) {
    return this.service.addItem(id, dto, context);
  }

  @Patch(':id/items/order')
  reorderItems(@Param('id') id: string, @Body() dto: ReorderWorshipOrderItemsDto, @CurrentOrganization() context: OrganizationContext) {
    return this.service.reorderItems(id, dto, context);
  }

  @Patch('items/:id')
  updateItem(@Param('id') id: string, @Body() dto: UpdateWorshipOrderItemDto, @CurrentOrganization() context: OrganizationContext) {
    return this.service.updateItem(id, dto, context);
  }

  @Delete('items/:id')
  deleteItem(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) {
    return this.service.deleteItem(id, context);
  }

  @Post('items/:id/materials')
  addMaterial(@Param('id') id: string, @Body() dto: CreateWorshipOrderMaterialDto, @CurrentOrganization() context: OrganizationContext) {
    return this.service.addMaterial(id, dto, context);
  }

  @Post('items/:id/demands')
  addDemand(@Param('id') id: string, @Body() dto: CreateWorshipServiceDemandDto, @CurrentOrganization() context: OrganizationContext) {
    return this.service.addDemand(id, dto, context);
  }

  @Patch(':id/publish')
  publish(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) {
    return this.service.publish(id, context);
  }

  @Patch('demands/:id/complete')
  completeDemand(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) {
    return this.service.completeDemand(id, context);
  }

  @Patch('demands/:id/cancel')
  cancelDemand(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) {
    return this.service.cancelDemand(id, context);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) {
    return this.service.findOne(id, context);
  }
}
