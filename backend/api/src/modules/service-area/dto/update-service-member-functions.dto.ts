import { ArrayMaxSize, IsArray, IsString, Length } from 'class-validator';

export class UpdateServiceMemberFunctionsDto {
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @Length(2, 100, { each: true })
  funcoes: string[];
}
