import { ServiceScheduleStatus } from '../../../generated/prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateServiceScheduleStatusDto {
  @IsEnum(ServiceScheduleStatus)
  status: ServiceScheduleStatus;
}
