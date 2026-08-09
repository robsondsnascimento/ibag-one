import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class UpdateWorshipRepertoireSongDto {
  @IsOptional()
  @IsString()
  @Length(2, 180)
  titulo?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  tom?: string;

  @IsOptional()
  @IsString()
  @Length(2, 180)
  artista?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @Length(5, 1000)
  referencia?: string;

  @IsOptional()
  @IsString()
  @Length(2, 3000)
  observacoes?: string;
}
