import { GoogleCalendarSyncService } from './google-calendar-sync.service';

describe('GoogleCalendarSyncService', () => {
  const prisma = {
    event: { findUnique: jest.fn() },
    googleCalendarEventSync: { upsert: jest.fn() },
  };
  const client = { isConfigured: jest.fn(), upsert: jest.fn(), remove: jest.fn() };
  const service = new GoogleCalendarSyncService(prisma as never, client as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registra o vínculo Google após sincronizar um evento aprovado', async () => {
    client.isConfigured.mockReturnValue(true);
    prisma.event.findUnique.mockResolvedValue({
      id: 'event-1', titulo: 'Culto', descricao: null, inicio: new Date('2031-01-15T18:00:00.000Z'), fim: new Date('2031-01-15T20:00:00.000Z'), status: 'APPROVED',
      cell: null, serviceAreas: [{ serviceArea: { nome: 'Louvor' } }], googleCalendarSync: null,
    });
    client.upsert.mockResolvedValue({ id: 'google-event-1' });

    await expect(service.sync('event-1')).resolves.toEqual({ status: 'SYNCED' });
    expect(prisma.googleCalendarEventSync.upsert).toHaveBeenCalledWith(expect.objectContaining({
      create: expect.objectContaining({ googleEventId: 'google-event-1', status: 'SYNCED' }),
    }));
  });

  it('não tenta enviar evento quando a integração está desligada', async () => {
    client.isConfigured.mockReturnValue(false);
    prisma.event.findUnique.mockResolvedValue({ id: 'event-1' });

    await expect(service.sync('event-1')).resolves.toEqual({ status: 'DISABLED' });
    expect(client.upsert).not.toHaveBeenCalled();
  });
});
