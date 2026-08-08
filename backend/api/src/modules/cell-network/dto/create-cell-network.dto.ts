import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateCellNetworkDto {

  @IsString()
  @Length(3, 150)
  nome: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  descricao?: string;

  @IsUUID()
  campusId: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

}
