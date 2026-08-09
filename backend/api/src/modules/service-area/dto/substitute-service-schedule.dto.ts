import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class SubstituteServiceScheduleDto {
  @IsUUID()
  personId: string;

  @IsOptional()
  @IsString()
  @Length(2, 1000)
  reason?: string;
}
