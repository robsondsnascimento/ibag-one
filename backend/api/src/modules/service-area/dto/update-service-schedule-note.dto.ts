import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateServiceScheduleNoteDto {
  @IsUUID()
  campusId: string;

  @IsDateString()
  data: string;

  @IsOptional()
  @IsUUID()
  eventId?: string;

  @IsString()
  @MaxLength(2000)
  observacao: string;
}
