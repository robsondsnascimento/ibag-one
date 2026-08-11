import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class SendRepertoireToWorshipOrderDto {
  @IsOptional()
  @IsUUID()
  orderItemId?: string;

  @IsUUID()
  receivingServiceAreaId: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;
}
