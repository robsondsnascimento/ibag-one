import { IsInt, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateWorshipOrderItemDto {
  @IsInt()
  @Min(1)
  sequencia: number;

  @IsString()
  @Length(2, 180)
  titulo: string;

  @IsOptional()
  @IsString()
  @Length(3, 20)
  horario?: string;

  @IsOptional()
  @IsUUID()
  responsiblePersonId?: string;

  @IsOptional()
  @IsUUID()
  serviceAreaId?: string;

  @IsOptional()
  @IsString()
  @Length(2, 3000)
  observacoes?: string;
}
