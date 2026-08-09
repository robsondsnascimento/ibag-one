import { IsOptional, IsUUID } from 'class-validator';

export class CreateWorshipOrderFromTemplateDto {
  @IsUUID()
  eventId: string;

  @IsOptional()
  @IsUUID()
  templateId?: string;
}
