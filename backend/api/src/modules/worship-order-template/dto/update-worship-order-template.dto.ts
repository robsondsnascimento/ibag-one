import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateWorshipOrderTemplateDto {
  @IsOptional()
  @IsString()
  @Length(2, 120)
  nome?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsBoolean()
  padrao?: boolean;
}
