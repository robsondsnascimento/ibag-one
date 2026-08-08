import { IsUUID } from 'class-validator';

export class CreateWorshipOrderDto {
  @IsUUID()
  eventId: string;
}
