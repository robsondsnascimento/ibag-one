import { IsOptional, IsString, Length } from 'class-validator';

export class RejectServiceScheduleSwapRequestDto {
  @IsOptional()
  @IsString()
  @Length(2, 1000)
  reason?: string;
}
