import { ConfigService } from '@nestjs/config';
import { NotificationDispatchService } from './notification-dispatch.service';

describe('NotificationDispatchService', () => {
  const input = {
    notificationId: 'notification-1',
    organizationId: 'organization-1',
    title: 'Alerta',
    message: 'Mensagem de teste',
    recipientPersonIds: ['person-1'],
  };

  it('mantém os canais externos desligados sem configuração', async () => {
    const service = new NotificationDispatchService(new ConfigService({}));

    await expect(service.publish(input)).resolves.toEqual([
      { channel: 'WHATSAPP', status: 'DISABLED' },
      { channel: 'PROPRESENTER', status: 'DISABLED' },
    ]);
  });

  it('entrega no webhook configurado sem deixar uma falha externa interromper o fluxo', async () => {
    const service = new NotificationDispatchService(new ConfigService({ WHATSAPP_WEBHOOK_URL: 'https://whatsapp.example.test' }));
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 });

    await expect(service.publish(input)).resolves.toEqual([
      { channel: 'WHATSAPP', status: 'DELIVERED' },
      { channel: 'PROPRESENTER', status: 'DISABLED' },
    ]);
    expect(global.fetch).toHaveBeenCalledWith('https://whatsapp.example.test', expect.objectContaining({ method: 'POST' }));

    global.fetch = originalFetch;
  });
});
