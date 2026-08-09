import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventStatus, GoogleCalendarSyncStatus } from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { GoogleCalendarClient } from './google-calendar.client';

export type GoogleCalendarSyncResult = {
  status: 'DISABLED' | 'SYNCED' | 'CANCELLED' | 'FAILED' | 'PENDING_APPROVAL';
};

@Injectable()
export class GoogleCalendarSyncService {
  private readonly logger = new Logger(GoogleCalendarSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly client: GoogleCalendarClient,
  ) {}

  isConfigured() {
    return this.client.isConfigured();
  }

  async sync(eventId: string): Promise<GoogleCalendarSyncResult> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        cell: { select: { nome: true } },
        serviceAreas: { include: { serviceArea: { select: { nome: true } } } },
        googleCalendarSync: true,
      },
    });
    if (!event) throw new NotFoundException('Evento não encontrado para sincronização');
    if (!this.client.isConfigured()) return { status: 'DISABLED' };

    if (event.status === EventStatus.CANCELLED) return this.cancel(event.id, event.googleCalendarSync?.googleEventId);
    if (event.status !== EventStatus.APPROVED) return { status: 'PENDING_APPROVAL' };

    try {
      const remote = await this.client.upsert({
        title: event.titulo,
        description: event.descricao,
        start: event.inicio,
        end: event.fim,
        cellName: event.cell?.nome,
        serviceAreaNames: event.serviceAreas.map(area => area.serviceArea.nome),
        ibagEventId: event.id,
      }, event.googleCalendarSync?.googleEventId);
      await this.prisma.googleCalendarEventSync.upsert({
        where: { eventId: event.id },
        create: {
          eventId: event.id,
          googleEventId: remote.id,
          status: GoogleCalendarSyncStatus.SYNCED,
          lastSyncedAt: new Date(),
          lastError: null,
        },
        update: {
          googleEventId: remote.id,
          status: GoogleCalendarSyncStatus.SYNCED,
          lastSyncedAt: new Date(),
          lastError: null,
        },
      });
      return { status: 'SYNCED' };
    } catch (error) {
      await this.fail(event.id, error);
      return { status: 'FAILED' };
    }
  }

  private async cancel(eventId: string, googleEventId?: string | null): Promise<GoogleCalendarSyncResult> {
    try {
      if (googleEventId) await this.client.remove(googleEventId);
      await this.prisma.googleCalendarEventSync.upsert({
        where: { eventId },
        create: { eventId, googleEventId, status: GoogleCalendarSyncStatus.CANCELLED, lastSyncedAt: new Date() },
        update: { status: GoogleCalendarSyncStatus.CANCELLED, lastSyncedAt: new Date(), lastError: null },
      });
      return { status: 'CANCELLED' };
    } catch (error) {
      await this.fail(eventId, error);
      return { status: 'FAILED' };
    }
  }

  private async fail(eventId: string, error: unknown) {
    const message = error instanceof Error ? error.message.slice(0, 500) : 'Falha desconhecida na sincronização Google';
    this.logger.error(`Não foi possível sincronizar o evento ${eventId} com o Google Calendar: ${message}`);
    await this.prisma.googleCalendarEventSync.upsert({
      where: { eventId },
      create: { eventId, status: GoogleCalendarSyncStatus.FAILED, lastError: message },
      update: { status: GoogleCalendarSyncStatus.FAILED, lastError: message },
    });
  }
}
