import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type GoogleCalendarEventInput = {
  title: string;
  description?: string | null;
  start: Date;
  end: Date;
  cellName?: string | null;
  serviceAreaNames: string[];
  ibagEventId: string;
};

type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
};

type GoogleEventResponse = {
  id: string;
  htmlLink?: string;
};

@Injectable()
export class GoogleCalendarClient {
  private accessToken?: { value: string; expiresAt: number };

  constructor(private readonly config: ConfigService) {}

  isConfigured() {
    return Boolean(
      this.config.get<string>('GOOGLE_CALENDAR_ID')
      && this.config.get<string>('GOOGLE_CALENDAR_CLIENT_ID')
      && this.config.get<string>('GOOGLE_CALENDAR_CLIENT_SECRET')
      && this.config.get<string>('GOOGLE_CALENDAR_REFRESH_TOKEN'),
    );
  }

  async upsert(input: GoogleCalendarEventInput, googleEventId?: string | null) {
    const calendarId = this.config.getOrThrow<string>('GOOGLE_CALENDAR_ID');
    const token = await this.token();
    const resource = {
      summary: input.title,
      description: this.description(input),
      start: { dateTime: input.start.toISOString(), timeZone: this.timeZone() },
      end: { dateTime: input.end.toISOString(), timeZone: this.timeZone() },
      extendedProperties: { private: { ibagEventId: input.ibagEventId } },
    };
    const url = googleEventId
      ? `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(googleEventId)}?sendUpdates=none`
      : `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=none`;
    const response = await fetch(url, {
      method: googleEventId ? 'PUT' : 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(resource),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Google Calendar respondeu HTTP ${response.status}`);
    return response.json() as Promise<GoogleEventResponse>;
  }

  async remove(googleEventId: string) {
    const calendarId = this.config.getOrThrow<string>('GOOGLE_CALENDAR_ID');
    const token = await this.token();
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(googleEventId)}?sendUpdates=none`,
      {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!response.ok && response.status !== 410) throw new Error(`Google Calendar respondeu HTTP ${response.status}`);
  }

  private async token() {
    if (this.accessToken && this.accessToken.expiresAt > Date.now()) return this.accessToken.value;

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.getOrThrow<string>('GOOGLE_CALENDAR_CLIENT_ID'),
        client_secret: this.config.getOrThrow<string>('GOOGLE_CALENDAR_CLIENT_SECRET'),
        refresh_token: this.config.getOrThrow<string>('GOOGLE_CALENDAR_REFRESH_TOKEN'),
        grant_type: 'refresh_token',
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Google OAuth respondeu HTTP ${response.status}`);
    const token = await response.json() as GoogleTokenResponse;
    this.accessToken = { value: token.access_token, expiresAt: Date.now() + Math.max(token.expires_in - 60, 1) * 1000 };
    return token.access_token;
  }

  private description(input: GoogleCalendarEventInput) {
    const references = [
      input.description?.trim(),
      input.cellName ? `Célula: ${input.cellName}` : undefined,
      input.serviceAreaNames.length ? `Áreas envolvidas: ${input.serviceAreaNames.join(', ')}` : undefined,
      `Gerenciado pelo IBAG One (evento ${input.ibagEventId}).`,
    ].filter(Boolean);
    return references.join('\n\n');
  }

  private timeZone() {
    return this.config.get<string>('GOOGLE_CALENDAR_TIME_ZONE') ?? 'America/Sao_Paulo';
  }
}
