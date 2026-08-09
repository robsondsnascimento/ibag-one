import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { OrganizationContext } from '../../common/context/organization-context';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApproveWorshipRepertoireDto,
  CreateWorshipRepertoireDto,
  CreateWorshipRepertoireSongDto,
  ReorderWorshipRepertoireSongsDto,
  ReturnWorshipRepertoireDto,
  SendRepertoireToWorshipOrderDto,
  UpdateWorshipRepertoireSongDto,
} from './dto';
import { WorshipRepertoireService } from './worship-repertoire.service';

@Controller('worship-repertoires')
@UseGuards(JwtAuthGuard)
export class WorshipRepertoireController {
  constructor(private readonly service: WorshipRepertoireService) {}

  @Post()
  create(@Body() dto: CreateWorshipRepertoireDto, @CurrentOrganization() context: OrganizationContext) {
    return this.service.create(dto, context);
  }

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string, @CurrentOrganization() context: OrganizationContext) {
    return this.service.findByEvent(eventId, context);
  }

  @Post(':id/songs')
  addSong(@Param('id') id: string, @Body() dto: CreateWorshipRepertoireSongDto, @CurrentOrganization() context: OrganizationContext) {
    return this.service.addSong(id, dto, context);
  }

  @Patch(':id/songs/order')
  reorderSongs(@Param('id') id: string, @Body() dto: ReorderWorshipRepertoireSongsDto, @CurrentOrganization() context: OrganizationContext) {
    return this.service.reorderSongs(id, dto, context);
  }

  @Patch('songs/:id')
  updateSong(@Param('id') id: string, @Body() dto: UpdateWorshipRepertoireSongDto, @CurrentOrganization() context: OrganizationContext) {
    return this.service.updateSong(id, dto, context);
  }

  @Delete('songs/:id')
  deleteSong(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) {
    return this.service.deleteSong(id, context);
  }

  @Patch(':id/submit')
  submit(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) {
    return this.service.submit(id, context);
  }

  @Patch(':id/return')
  returnForAdjustment(@Param('id') id: string, @Body() dto: ReturnWorshipRepertoireDto, @CurrentOrganization() context: OrganizationContext) {
    return this.service.returnForAdjustment(id, dto, context);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() dto: ApproveWorshipRepertoireDto, @CurrentOrganization() context: OrganizationContext) {
    return this.service.approve(id, dto, context);
  }

  @Patch(':id/send-to-worship-order')
  sendToWorshipOrder(@Param('id') id: string, @Body() dto: SendRepertoireToWorshipOrderDto, @CurrentOrganization() context: OrganizationContext) {
    return this.service.sendToWorshipOrder(id, dto, context);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentOrganization() context: OrganizationContext) {
    return this.service.findOne(id, context);
  }
}
