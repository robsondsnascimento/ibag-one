import { WorshipMaterialType } from '../../../generated/prisma/client';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class CreateWorshipOrderMaterialDto {
  @IsEnum(WorshipMaterialType)
  type: WorshipMaterialType;

  @IsString()
  @Length(2, 180)
  titulo: string;

  @IsOptional()
  @IsString()
  @Length(2, 1000)
  referencia?: string;
}
