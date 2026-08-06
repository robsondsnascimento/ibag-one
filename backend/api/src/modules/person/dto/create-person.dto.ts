import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreatePersonDto {

  @IsString()
  @Length(3, 150)
  nome: string;


  @IsOptional()
  @IsString()
  sexo?: string;


  @IsOptional()
  @IsDateString()
  dataNascimento?: string;


  @IsOptional()
  @IsString()
  @Length(11, 14)
  cpf?: string;


  @IsOptional()
  @IsString()
  telefone?: string;


  @IsOptional()
  @IsEmail()
  email?: string;


  @IsOptional()
  @IsDateString()
  dataDecisao?: string;


  @IsOptional()
  @IsDateString()
  dataBatismo?: string;


  @IsOptional()
  @IsDateString()
  dataMembresia?: string;


  @IsUUID()
  organizationId: string;


  @IsUUID()
  campusId: string;


  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

}
