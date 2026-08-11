import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  EventStatus,
  EventType,
  NotificationAudience,
  ServiceMembershipRole,
  ServiceOperationalRole,
  WorshipMaterialType,
  WorshipOrderStatus,
  WorshipRepertoireStatus,
} from '../../generated/prisma/client';
import { hasAnyUserRole, hasPastoralCampusAccess } from '../../common/access/user-role.util';
import { OrganizationContext } from '../../common/context/organization-context';
import { PrismaService } from '../../database/prisma.service';
import {
  ApproveWorshipRepertoireDto,
  CreateWorshipRepertoireDto,
  CreateWorshipRepertoireSongDto,
  ReorderWorshipRepertoireSongsDto,
  ReturnWorshipRepertoireDto,
  SendRepertoireToWorshipOrderDto,
  UpdateWorshipRepertoireSongDto,
} from './dto';

@Injectable()
export class WorshipRepertoireService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorshipRepertoireDto, context: OrganizationContext) {
    const event = await this.event(dto.eventId, context);
    await this.eventArea(dto.serviceAreaId, event, context);
    await this.assertMinister(dto.serviceAreaId, context);
    this.assertUniqueSequences(dto.songs);

    const existing = await this.prisma.worshipRepertoire.findFirst({ where: { eventId: event.id, serviceAreaId: dto.serviceAreaId } });
    if (existing) throw new BadRequestException('Já existe um repertório para esta área neste culto');

    const repertoire = await this.prisma.worshipRepertoire.create({
      data: {
        organizationId: context.organizationId,
        eventId: event.id,
        serviceAreaId: dto.serviceAreaId,
        submittedByPersonId: context.personId,
        songs: { create: dto.songs },
      },
      include: this.details,
    });
    return this.withSubmissionDeadline(repertoire);
  }

  async findByEvent(eventId: string, context: OrganizationContext) {
    await this.event(eventId, context, false);
    const repertoires = await this.prisma.worshipRepertoire.findMany({
      where: { eventId, organizationId: context.organizationId },
      include: this.details,
      orderBy: { createdAt: 'asc' },
    });
    return repertoires.map(repertoire => this.withSubmissionDeadline(repertoire));
  }

  async findOne(id: string, context: OrganizationContext) {
    return this.repertoire(id, context);
  }

  async addSong(id: string, dto: CreateWorshipRepertoireSongDto, context: OrganizationContext) {
    const repertoire = await this.repertoire(id, context);
    await this.assertSubmitter(repertoire, context);
    this.assertEditable(repertoire);
    const duplicate = await this.prisma.worshipRepertoireSong.findFirst({ where: { repertoireId: id, sequencia: dto.sequencia } });
    if (duplicate) throw new BadRequestException('Já existe uma música nesta posição do repertório');
    return this.prisma.worshipRepertoireSong.create({ data: { ...dto, repertoireId: id } });
  }

  async updateSong(songId: string, dto: UpdateWorshipRepertoireSongDto, context: OrganizationContext) {
    const song = await this.song(songId, context);
    await this.assertSubmitter(song.repertoire, context);
    this.assertEditable(song.repertoire);
    return this.prisma.worshipRepertoireSong.update({ where: { id: songId }, data: dto });
  }

  async deleteSong(songId: string, context: OrganizationContext) {
    const song = await this.song(songId, context);
    await this.assertSubmitter(song.repertoire, context);
    this.assertEditable(song.repertoire);
    if (song.repertoire.songs.length <= 1) throw new BadRequestException('O repertório precisa manter ao menos uma música');
    return this.prisma.worshipRepertoireSong.delete({ where: { id: songId } });
  }

  async reorderSongs(id: string, dto: ReorderWorshipRepertoireSongsDto, context: OrganizationContext) {
    const repertoire = await this.repertoire(id, context);
    await this.assertSubmitter(repertoire, context);
    this.assertEditable(repertoire);
    const songs = await this.prisma.worshipRepertoireSong.findMany({ where: { repertoireId: id }, select: { id: true, sequencia: true } });
    const existingIds = new Set(songs.map(song => song.id));
    const requestedIds = new Set(dto.songs.map(song => song.id));
    const sequences = new Set(dto.songs.map(song => song.sequencia));
    if (songs.length !== dto.songs.length || requestedIds.size !== dto.songs.length || sequences.size !== dto.songs.length || [...requestedIds].some(songId => !existingIds.has(songId))) {
      throw new BadRequestException('A reordenação deve informar todas as músicas, sem repetições');
    }

    const offset = Math.max(0, ...songs.map(song => song.sequencia), ...dto.songs.map(song => song.sequencia)) + songs.length + 1;
    await this.prisma.$transaction(async tx => {
      for (const song of songs) {
        await tx.worshipRepertoireSong.update({ where: { id: song.id }, data: { sequencia: song.sequencia + offset } });
      }
      for (const song of dto.songs) {
        await tx.worshipRepertoireSong.update({ where: { id: song.id }, data: { sequencia: song.sequencia } });
      }
    });
    return this.repertoire(id, context);
  }

  async submit(id: string, context: OrganizationContext) {
    const repertoire = await this.repertoire(id, context);
    await this.assertSubmitter(repertoire, context);
    if (![WorshipRepertoireStatus.DRAFT, WorshipRepertoireStatus.RETURNED].includes(repertoire.status)) {
      throw new BadRequestException('Somente repertórios em rascunho ou devolvidos podem ser enviados para aprovação');
    }
    if (!repertoire.songs.length) throw new BadRequestException('Inclua ao menos uma música antes de enviar o repertório');
    await this.assertConfirmedSchedule(repertoire, context);
    const isLateSubmission = new Date() > repertoire.submissionDeadline;

    const submitted = await this.prisma.worshipRepertoire.update({
      where: { id },
      data: {
        status: WorshipRepertoireStatus.SUBMITTED,
        submittedAt: new Date(),
        reviewComment: null,
        approvedAt: null,
        approvedByPersonId: null,
      },
      include: this.details,
    });
    await this.notifyMusicLeaders(
      submitted,
      isLateSubmission ? 'Repertório enviado com atraso' : 'Repertório aguardando aprovação',
      isLateSubmission
        ? `O repertório do culto "${submitted.event.titulo}" foi enviado após o prazo de ${this.formatDate(repertoire.submissionDeadline)}.`
        : `O repertório do culto "${submitted.event.titulo}" foi enviado para sua revisão.`,
    );
    return this.withSubmissionDeadline(submitted);
  }

  async returnForAdjustment(id: string, dto: ReturnWorshipRepertoireDto, context: OrganizationContext) {
    const repertoire = await this.repertoire(id, context);
    await this.assertLeader(repertoire.serviceAreaId, repertoire.event, context);
    if (repertoire.status !== WorshipRepertoireStatus.SUBMITTED) throw new BadRequestException('Somente repertórios enviados podem ser devolvidos para ajuste');

    const returned = await this.prisma.worshipRepertoire.update({
      where: { id },
      data: { status: WorshipRepertoireStatus.RETURNED, reviewComment: dto.comentario, approvedAt: null, approvedByPersonId: null },
      include: this.details,
    });
    await this.notifyPeople([returned.submittedByPersonId], 'Repertório devolvido para ajuste', dto.comentario, returned, returned.serviceAreaId);
    return this.withSubmissionDeadline(returned);
  }

  async approve(id: string, dto: ApproveWorshipRepertoireDto, context: OrganizationContext) {
    const repertoire = await this.repertoire(id, context);
    await this.assertLeader(repertoire.serviceAreaId, repertoire.event, context);
    if (repertoire.status !== WorshipRepertoireStatus.SUBMITTED) throw new BadRequestException('Somente repertórios enviados podem ser aprovados');

    const approved = await this.prisma.worshipRepertoire.update({
      where: { id },
      data: {
        status: WorshipRepertoireStatus.APPROVED,
        reviewComment: dto.comentario,
        approvedAt: new Date(),
        approvedByPersonId: context.personId,
      },
      include: this.details,
    });
    await this.notifyPeople([approved.submittedByPersonId], 'Repertório aprovado', `O repertório do culto "${approved.event.titulo}" foi aprovado e pode ser encaminhado para a Ordem de Culto.`, approved, approved.serviceAreaId);
    return this.withSubmissionDeadline(approved);
  }

  async sendToWorshipOrder(id: string, dto: SendRepertoireToWorshipOrderDto, context: OrganizationContext) {
    const repertoire = await this.repertoire(id, context);
    await this.assertLeader(repertoire.serviceAreaId, repertoire.event, context);
    if (repertoire.status !== WorshipRepertoireStatus.APPROVED) throw new BadRequestException('Somente repertórios aprovados podem ser enviados para a Ordem de Culto');

    const destinations = dto.orderItemId
      ? await this.manualOrderItemDestinations(dto.orderItemId, repertoire, context)
      : await this.momentOrderItemDestinations(repertoire, context);
    const orderItem = destinations[0].orderItem;
    await this.eventArea(dto.receivingServiceAreaId, repertoire.event, context);

    const demand = await this.prisma.$transaction(async tx => {
      await tx.worshipOrderMaterial.createMany({
        data: destinations.map(({ song, orderItem: destination }) => ({
          type: WorshipMaterialType.MUSIC,
          titulo: this.songTitle(song),
          referencia: song.referencia,
          itemId: destination.id,
        })),
      });
      if (!dto.orderItemId) {
        await Promise.all(
          destinations.map(({ song, orderItem }) =>
            tx.worshipOrderItem.update({
              where: { id: orderItem.id },
              data: {
                titulo: `Música ${song.sequencia} · ${song.titulo}`,
                observacoes: this.musicOrderItemDetails(song),
              },
            }),
          ),
        );
      }
      const createdDemand = await tx.worshipServiceDemand.create({
        data: {
          descricao: `Preparar repertório aprovado: ${repertoire.songs.map(song => song.titulo).join(', ')}`,
          dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
          itemId: orderItem.id,
          serviceAreaId: dto.receivingServiceAreaId,
        },
      });
      await tx.worshipRepertoire.update({
        where: { id },
        data: {
          status: WorshipRepertoireStatus.SENT_TO_WORSHIP_ORDER,
          sentToWorshipOrderAt: new Date(),
          orderItemId: orderItem.id,
          deliveryDemandId: createdDemand.id,
        },
      });
      return createdDemand;
    });
    const destinationDescription = dto.orderItemId ? `o item "${orderItem.titulo}"` : 'as posições do modelo de músicas';
    await this.notifyArea(dto.receivingServiceAreaId, repertoire, `Repertório aprovado: ${repertoire.event.titulo}`, `Prepare o repertório aprovado para ${destinationDescription}.`, context);
    return this.repertoire(id, context);
  }

  private async manualOrderItemDestinations(orderItemId: string, repertoire: any, context: OrganizationContext) {
    const orderItem = await this.prisma.worshipOrderItem.findFirst({
      where: {
        id: orderItemId,
        serviceAreaId: repertoire.serviceAreaId,
        order: { eventId: repertoire.eventId, event: { organizationId: context.organizationId } },
      },
      include: { order: true },
    });
    if (!orderItem) throw new BadRequestException('Informe o item de louvor desta ordem de culto vinculado à área de Música');
    if (orderItem.order.status !== WorshipOrderStatus.DRAFT) throw new BadRequestException('O repertório só pode ser encaminhado enquanto a ordem de culto estiver em rascunho');
    return repertoire.songs.map(song => ({ song, orderItem }));
  }

  private async momentOrderItemDestinations(repertoire: any, context: OrganizationContext) {
    const order = await this.prisma.worshipOrder.findFirst({
      where: { eventId: repertoire.eventId, event: { organizationId: context.organizationId } },
      include: { items: { select: { id: true, titulo: true, sequencia: true, serviceAreaId: true } } },
    });
    if (!order) throw new BadRequestException('Crie a Ordem de Culto antes de encaminhar o repertório');
    if (order.status !== WorshipOrderStatus.DRAFT) throw new BadRequestException('O repertório só pode ser encaminhado enquanto a ordem de culto estiver em rascunho');
    const musicItems = order.items.filter(item => item.serviceAreaId === repertoire.serviceAreaId);
    const usedItemIds = new Set<string>();
    const destinations = repertoire.songs.map(song => {
      const moment = song.observacoes?.trim();
      const orderItem = moment
        ? musicItems.find(item => this.sameMoment(item.titulo, moment))
        : musicItems.find(item => !usedItemIds.has(item.id));
      if (!orderItem) throw new BadRequestException(`A música "${song.titulo}" precisa informar um momento do modelo que exista na Ordem de Culto, ou ser encaminhada manualmente para um item.`);
      if (usedItemIds.has(orderItem.id)) {
        throw new BadRequestException(`O momento "${moment}" foi informado para mais de uma música. Escolha momentos diferentes ou encaminhe manualmente.`);
      }
      usedItemIds.add(orderItem.id);
      return { song, orderItem };
    });
    if (!destinations.length) throw new BadRequestException('O repertório precisa conter ao menos uma música');
    return destinations;
  }

  private sameMoment(first: string, second: string) {
    return this.normalizeMoment(first) === this.normalizeMoment(second);
  }

  private normalizeMoment(value: string) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
  }

  private async repertoire(id: string, context: OrganizationContext): Promise<any> {
    const repertoire = await this.prisma.worshipRepertoire.findFirst({
      where: { id, organizationId: context.organizationId },
      include: this.details,
    });
    if (!repertoire) throw new NotFoundException('Repertório não encontrado na organização atual');
    return this.withSubmissionDeadline(repertoire);
  }

  private async song(id: string, context: OrganizationContext): Promise<any> {
    const song = await this.prisma.worshipRepertoireSong.findFirst({
      where: { id, repertoire: { organizationId: context.organizationId } },
      include: { repertoire: { include: this.details } },
    });
    if (!song) throw new NotFoundException('Música do repertório não encontrada');
    return song;
  }

  private async event(id: string, context: OrganizationContext, requiresApproval = true): Promise<any> {
    const event = await this.prisma.event.findFirst({
      where: { id, organizationId: context.organizationId, type: EventType.WORSHIP, ...(requiresApproval ? { status: EventStatus.APPROVED } : {}) },
      include: { campus: true, serviceAreas: true },
    });
    if (!event) throw new NotFoundException('Culto aprovado não encontrado na organização atual');
    return event;
  }

  private async eventArea(serviceAreaId: string, event: { campusId: string; serviceAreas: { serviceAreaId: string }[] }, context: OrganizationContext) {
    if (!event.serviceAreas.some(area => area.serviceAreaId === serviceAreaId)) {
      throw new BadRequestException('A área de serviço precisa estar envolvida no culto');
    }
    const area = await this.prisma.serviceArea.findFirst({
      where: { id: serviceAreaId, organizationId: context.organizationId, ativo: true, OR: [{ scope: 'GLOBAL' }, { campusId: event.campusId }] },
    });
    if (!area) throw new BadRequestException('Área de serviço inválida para o campus deste culto');
    return area;
  }

  private async assertMinister(serviceAreaId: string, context: OrganizationContext, teamId?: string) {
    const operationalRole = await this.prisma.serviceOperationalRoleAssignment.findFirst({
      where: {
        personId: context.personId,
        serviceAreaId,
        organizationId: context.organizationId,
        role: ServiceOperationalRole.WORSHIP_MINISTER,
        ativo: true,
        ...(teamId ? { teamId } : {}),
        team: { ativo: true, memberships: { some: { personId: context.personId, ativo: true } } },
      },
    });
    if (operationalRole) return;

    const ministerMembership = await this.prisma.serviceMembership.findFirst({
      where: {
        personId: context.personId,
        serviceAreaId,
        ativo: true,
        funcoes: { has: 'Ministro' },
        ...(teamId ? { teamId } : {}),
        team: { ativo: true },
      },
    });
    if (!ministerMembership) throw new ForbiddenException('Somente quem possui a função Ministro ativa na equipe pode preparar o repertório');
  }

  private async assertConfirmedSchedule(repertoire: { eventId: string; serviceAreaId: string }, context: OrganizationContext) {
    const schedule = await this.prisma.serviceSchedule.findFirst({
      where: {
        personId: context.personId,
        eventId: repertoire.eventId,
        status: 'CONFIRMED',
        team: { serviceAreaId: repertoire.serviceAreaId, ativo: true },
      },
      select: { id: true, teamId: true },
    });
    if (!schedule) {
      throw new ForbiddenException('O Ministro de Louvor precisa possuir uma escala confirmada neste culto para enviar o repertório');
    }
    await this.assertMinister(repertoire.serviceAreaId, context, schedule.teamId);
  }

  private async assertSubmitter(repertoire: { submittedByPersonId: string; serviceAreaId: string }, context: OrganizationContext) {
    if (repertoire.submittedByPersonId !== context.personId) throw new ForbiddenException('Somente o ministro que criou o repertório pode alterá-lo');
    await this.assertMinister(repertoire.serviceAreaId, context);
  }

  private async assertLeader(serviceAreaId: string, event: { campusId: string }, context: OrganizationContext) {
    const user = await this.user(context);
    if (hasAnyUserRole(user, ['SECRETARY', 'WORSHIP_ORDER_MANAGER', 'ADMIN', 'SUPER_ADMIN']) || hasPastoralCampusAccess(user, event.campusId)) return;
    const leader = await this.prisma.serviceMembership.findFirst({
      where: {
        personId: context.personId,
        serviceAreaId,
        ativo: true,
        OR: [
          { role: ServiceMembershipRole.GENERAL_LEADER },
          { role: ServiceMembershipRole.CAMPUS_LEADER, campusId: event.campusId },
          { role: ServiceMembershipRole.TEAM_LEADER, team: { campusId: event.campusId } },
        ],
      },
    });
    if (!leader) throw new ForbiddenException('Somente a liderança de louvor pode revisar ou encaminhar o repertório');
  }

  private async user(context: OrganizationContext) {
    const user = await this.prisma.user.findFirst({
      where: { id: context.userId, organizationId: context.organizationId, ativo: true },
      include: { person: { select: { campusId: true, campusMemberships: { where: { ativo: true }, select: { campusId: true } } } }, additionalRoles: { select: { role: true } } },
    });
    if (!user) throw new ForbiddenException('Usuário sem vínculo organizacional ativo');
    return user;
  }

  private assertEditable(repertoire: { status: WorshipRepertoireStatus }) {
    const editableStatuses: WorshipRepertoireStatus[] = [WorshipRepertoireStatus.DRAFT, WorshipRepertoireStatus.RETURNED];
    if (!editableStatuses.includes(repertoire.status)) {
      throw new BadRequestException('O repertório só pode ser alterado enquanto estiver em rascunho ou devolvido para ajuste');
    }
  }

  private assertUniqueSequences(songs: CreateWorshipRepertoireSongDto[]) {
    if (new Set(songs.map(song => song.sequencia)).size !== songs.length) {
      throw new BadRequestException('As músicas do repertório precisam ter sequências únicas');
    }
  }

  private songTitle(song: { sequencia: number; titulo: string; tom: string | null }) {
    return `${song.sequencia}. ${song.titulo}${song.tom ? ` (${song.tom})` : ''}`;
  }

  private musicOrderItemDetails(song: { observacoes?: string | null; tom?: string | null; artista?: string | null; referencia?: string | null }) {
    return [
      song.observacoes?.trim() ? `Momento: ${song.observacoes.trim()}` : null,
      song.tom ? `Tom: ${song.tom}` : null,
      song.artista ? `Versão: ${song.artista}` : null,
      song.referencia ? 'Link da versão disponível nos materiais.' : null,
    ].filter(Boolean).join(' · ');
  }

  private async notifyMusicLeaders(repertoire: any, titulo: string, mensagem: string) {
    const leaders = await this.prisma.serviceMembership.findMany({
      where: {
        serviceAreaId: repertoire.serviceAreaId,
        ativo: true,
        OR: [
          { role: ServiceMembershipRole.GENERAL_LEADER },
          { role: ServiceMembershipRole.CAMPUS_LEADER, campusId: repertoire.event.campusId },
          { role: ServiceMembershipRole.TEAM_LEADER, team: { campusId: repertoire.event.campusId } },
        ],
      },
      select: { personId: true },
      distinct: ['personId'],
    });
    await this.notifyPeople(leaders.map(leader => leader.personId), titulo, mensagem, repertoire, repertoire.serviceAreaId);
  }

  private async notifyArea(serviceAreaId: string, repertoire: any, titulo: string, mensagem: string, context: OrganizationContext) {
    const members = await this.prisma.serviceMembership.findMany({
      where: { serviceAreaId, ativo: true, serviceArea: { organizationId: context.organizationId } },
      select: { personId: true },
      distinct: ['personId'],
    });
    await this.notifyPeople(members.map(member => member.personId), titulo, mensagem, repertoire, serviceAreaId);
  }

  private async notifyPeople(personIds: string[], titulo: string, mensagem: string, repertoire: any, serviceAreaId?: string) {
    const recipients = [...new Set(personIds)];
    if (!recipients.length) return;
    await this.prisma.notification.create({
      data: {
        titulo,
        mensagem,
        audience: NotificationAudience.PERSON,
        organizationId: repertoire.organizationId,
        eventId: repertoire.eventId,
        serviceAreaId,
        recipients: { create: recipients.map(personId => ({ personId })) },
      },
    });
  }

  private withSubmissionDeadline(repertoire: any) {
    const submissionDeadline = this.submissionDeadline(repertoire.event.inicio);
    return { ...repertoire, submissionDeadline, isLateSubmission: new Date() > submissionDeadline };
  }

  private submissionDeadline(eventStart: Date) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(eventStart);
    const value = (type: string) => Number(parts.find(part => part.type === type)?.value);
    const localDate = new Date(Date.UTC(value('year'), value('month') - 1, value('day')));
    localDate.setUTCDate(localDate.getUTCDate() - ((localDate.getUTCDay() + 6) % 7));
    const year = localDate.getUTCFullYear();
    const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(localDate.getUTCDate()).padStart(2, '0');
    return new Date(`${year}-${month}-${day}T23:59:59.999-03:00`);
  }

  private formatDate(value: Date) {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(value);
  }

  private readonly details = {
    event: { include: { campus: true, serviceAreas: { include: { serviceArea: true } } } },
    serviceArea: true,
    submittedByPerson: true,
    approvedByPerson: true,
    orderItem: { include: { order: true, serviceArea: true } },
    deliveryDemand: { include: { serviceArea: true, responsiblePerson: true } },
    songs: { orderBy: { sequencia: 'asc' as const } },
  } as const;
}
