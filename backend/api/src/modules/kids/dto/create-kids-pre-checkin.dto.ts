import { IsUUID } from 'class-validator'; export class CreateKidsPreCheckInDto { @IsUUID() childId: string; @IsUUID() eventId: string; }
