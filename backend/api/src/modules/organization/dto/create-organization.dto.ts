import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrganizationDto {

  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  dominio: string;
}
