import { ServiceScheduleStatus } from '../../../generated/prisma/client';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class UpdateServiceScheduleStatusDto {
  @IsEnum(ServiceScheduleStatus)
  status: ServiceScheduleStatus;

  @IsOptional()
  @IsString()
  @Length(2, 1000)
  reason?: string;
}
