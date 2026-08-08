import { IsDateString, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateWorshipServiceDemandDto {
  @IsString()
  @Length(3, 1000)
  descricao: string;

  @IsUUID()
  serviceAreaId: string;

  @IsOptional()
  @IsUUID()
  responsiblePersonId?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;
}
