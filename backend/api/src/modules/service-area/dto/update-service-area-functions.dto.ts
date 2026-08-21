import { ArrayMaxSize, IsArray, IsString, Length } from 'class-validator';

export class UpdateServiceAreaFunctionsDto {
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @Length(2, 100, { each: true })
  funcoes: string[];
}
