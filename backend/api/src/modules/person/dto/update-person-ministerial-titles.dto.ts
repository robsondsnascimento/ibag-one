import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdatePersonMinisterialTitlesDto {
  @IsArray()
  @ArrayMaxSize(8)
  @ArrayUnique((title: string) => title.trim().toLocaleLowerCase('pt-BR'))
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  titulosMinisteriais: string[];
}
