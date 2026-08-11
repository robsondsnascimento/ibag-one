import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateServiceAreaDto {
  @IsOptional()
  @IsString()
  @Length(3, 150)
  nome?: string;

  @IsOptional()
  @IsString()
  @Length(3, 1000)
  descricao?: string | null;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
