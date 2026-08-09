import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class SendRepertoireToWorshipOrderDto {
  @IsUUID()
  orderItemId: string;

  @IsUUID()
  receivingServiceAreaId: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;
}
