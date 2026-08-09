import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { GoogleCalendarClient } from './google-calendar.client';
import { GoogleCalendarSyncService } from './google-calendar-sync.service';

@Module({
  imports: [DatabaseModule],
  providers: [GoogleCalendarClient, GoogleCalendarSyncService],
  exports: [GoogleCalendarSyncService],
})
export class GoogleCalendarModule {}
