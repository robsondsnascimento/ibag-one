import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type ExternalNotificationInput = {
  notificationId: string;
  organizationId: string;
  title: string;
  message: string;
  recipientPersonIds: string[];
  eventId?: string | null;
};

export type ExternalDeliveryResult = {
  channel: 'WHATSAPP' | 'PROPRESENTER';
  status: 'DISABLED' | 'DELIVERED' | 'FAILED';
};

@Injectable()
export class NotificationDispatchService {
  private readonly logger = new Logger(NotificationDispatchService.name);

  constructor(private readonly config: ConfigService) {}

  async publish(input: ExternalNotificationInput): Promise<ExternalDeliveryResult[]> {
    return Promise.all([
      this.deliver('WHATSAPP', 'WHATSAPP_WEBHOOK_URL', 'WHATSAPP_WEBHOOK_TOKEN', input),
      this.deliver('PROPRESENTER', 'PROPRESENTER_WEBHOOK_URL', 'PROPRESENTER_WEBHOOK_TOKEN', input),
    ]);
  }

  private async deliver(
    channel: ExternalDeliveryResult['channel'],
    urlKey: string,
    tokenKey: string,
    input: ExternalNotificationInput,
  ): Promise<ExternalDeliveryResult> {
    const url = this.config.get<string>(urlKey);
    if (!url) return { channel, status: 'DISABLED' };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(this.config.get<string>(tokenKey) ? { authorization: `Bearer ${this.config.get<string>(tokenKey)}` } : {}),
        },
        body: JSON.stringify({ channel, ...input }),
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) {
        this.logger.warn(`${channel} recusou a notificação com HTTP ${response.status}.`);
        return { channel, status: 'FAILED' };
      }
      return { channel, status: 'DELIVERED' };
    } catch (error) {
      this.logger.warn(`${channel} indisponível para a notificação ${input.notificationId}: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
      return { channel, status: 'FAILED' };
    }
  }
}
