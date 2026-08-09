import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { OrganizationContext } from '../../common/context/organization-context';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateWorshipOrderTemplateDto,
  CreateWorshipOrderTemplateItemDto,
  ReorderWorshipOrderTemplateItemsDto,
  UpdateWorshipOrderTemplateDto,
  UpdateWorshipOrderTemplateItemDto,
} from './dto';
import { WorshipOrderTemplateService } from './worship-order-template.service';

@Controller('worship-order-templates')
@UseGuards(JwtAuthGuard)
export class WorshipOrderTemplateController {
  constructor(private readonly service: WorshipOrderTemplateService) {}

  @Post()
  create(@Body() dto: CreateWorshipOrderTemplateDto, @CurrentOrganization() context: OrganizationContext) {
    return this.service.create(dto, context);
  }

  @Get()
  findAll(@CurrentOrganization() context: OrganizationContext) {
    return this.service.findAll(context);
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() dto: CreateWorshipOrderTemplateItemDto, @CurrentOrganization() context: OrganizationContext) {
    return this.service.addItem(id, dto, context);
  }

  @Patch(':id/items/order')
  reorderItems(@Param('id') id: string, @Body() dto: ReorderWorshipOrderTemplateItemsDto, @CurrentOrganization() context: OrganizationContext) {
    return this.service.reorderItems(id, dto, context);
  }

  @Patch('items/:id')
  updateItem(@Param('id') id: string, @Body() dto: UpdateWorshipOrderTemplateItemDto, @CurrentOrganization() context: OrganizationContext) {
    return this.service.updateItem(id, dto, context);
  }

  @Delete('items/:id')
  deleteItem(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) {
    return this.service.deleteItem(id, context);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorshipOrderTemplateDto, @CurrentOrganization() context: OrganizationContext) {
    return this.service.update(id, dto, context);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) {
    return this.service.findOne(id, context);
  }
}
