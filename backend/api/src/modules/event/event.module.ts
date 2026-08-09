import { Module } from '@nestjs/common'; import { GoogleCalendarModule } from '../google-calendar/google-calendar.module'; import { EventController } from './event.controller'; import { EventService } from './event.service';
@Module({ imports: [GoogleCalendarModule], controllers: [EventController], providers: [EventService] }) export class EventModule {}
