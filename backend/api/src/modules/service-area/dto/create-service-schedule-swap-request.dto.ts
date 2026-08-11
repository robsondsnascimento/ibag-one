import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateServiceScheduleSwapRequestDto {
  @IsUUID()
  replacementPersonId: string;

  @IsOptional()
  @IsString()
  @Length(2, 1000)
  reason?: string;
}
