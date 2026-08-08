import { IsDateString, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateServiceScheduleDto {
  @IsUUID()
  personId: string;

  @IsDateString()
  data: string;

  @IsString()
  @Length(2, 100)
  funcao: string;

  @IsOptional()
  @IsString()
  @Length(2, 1000)
  observacao?: string;

  @IsOptional()
  @IsUUID()
  eventId?: string;
}
