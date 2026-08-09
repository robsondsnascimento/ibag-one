import { ConfigService } from '@nestjs/config';
import { GoogleCalendarClient } from './google-calendar.client';

describe('GoogleCalendarClient', () => {
  const configuration = {
    GOOGLE_CALENDAR_ID: 'agenda@ibag.one',
    GOOGLE_CALENDAR_CLIENT_ID: 'client-id',
    GOOGLE_CALENDAR_CLIENT_SECRET: 'client-secret',
    GOOGLE_CALENDAR_REFRESH_TOKEN: 'refresh-token',
  };
  const input = {
    title: 'Evento de teste',
    description: 'Descrição de teste',
    start: new Date('2031-01-15T18:00:00.000Z'),
    end: new Date('2031-01-15T20:00:00.000Z'),
    cellName: 'Célula Esperança',
    serviceAreaNames: ['Louvor'],
    ibagEventId: 'event-1',
  };
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('permanece desligado sem as credenciais completas da conta institucional', () => {
    const client = new GoogleCalendarClient(new ConfigService({ GOOGLE_CALENDAR_ID: 'agenda@ibag.one' }));

    expect(client.isConfigured()).toBe(false);
  });

  it('renova o token e cria o evento no calendário compartilhado', async () => {
    const client = new GoogleCalendarClient(new ConfigService(configuration));
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue({ access_token: 'access-token', expires_in: 3600 }) })
      .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue({ id: 'google-event-1' }) });

    await expect(client.upsert(input)).resolves.toEqual({ id: 'google-event-1' });
    expect(global.fetch).toHaveBeenNthCalledWith(1, 'https://oauth2.googleapis.com/token', expect.objectContaining({ method: 'POST' }));
    expect(global.fetch).toHaveBeenNthCalledWith(2, expect.stringContaining('/calendars/agenda%40ibag.one/events?sendUpdates=none'), expect.objectContaining({ method: 'POST' }));
  });
});
