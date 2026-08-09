import { IsOptional, IsString, IsUUID, Length, ValidateIf } from 'class-validator';

export class UpdateWorshipOrderTemplateItemDto {
  @IsOptional()
  @IsString()
  @Length(2, 180)
  titulo?: string;

  @IsOptional()
  @IsString()
  @Length(3, 20)
  horario?: string;

  @IsOptional()
  @ValidateIf((_object, value) => value !== null)
  @IsUUID()
  serviceAreaId?: string | null;

  @IsOptional()
  @IsString()
  @Length(2, 3000)
  observacoes?: string;
}
