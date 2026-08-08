import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateServiceTeamDto {
  @IsString()
  @Length(3, 150)
  nome: string;

  @IsOptional()
  @IsString()
  @Length(3, 1000)
  descricao?: string;

  @IsUUID()
  campusId: string;
}
