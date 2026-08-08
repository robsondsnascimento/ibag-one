import { ServiceAreaScope } from '../../../generated/prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateServiceAreaDto {
  @IsString()
  @Length(3, 150)
  nome: string;

  @IsOptional()
  @IsString()
  @Length(3, 1000)
  descricao?: string;

  @IsEnum(ServiceAreaScope)
  scope: ServiceAreaScope;

  @IsOptional()
  @IsUUID()
  campusId?: string;
}
