import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateServiceAreaApplicationDto {
  @IsUUID()
  serviceAreaId: string;

  @IsOptional()
  @IsUUID()
  personId?: string;

  @IsOptional()
  @IsUUID()
  desiredTeamId?: string;

  @IsOptional()
  @IsString()
  @Length(2, 1000)
  observacao?: string;
}
