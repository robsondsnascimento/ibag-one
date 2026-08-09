import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateServiceAreaEntryStageDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  nome?: string;

  @IsOptional()
  @IsString()
  @Length(2, 1000)
  descricao?: string;

  @IsOptional()
  @IsBoolean()
  obrigatoria?: boolean;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
