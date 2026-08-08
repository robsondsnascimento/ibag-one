import { IsDateString, IsOptional, IsString, Length } from 'class-validator';
export class CreateCellStudyDto {
  @IsString() @Length(3, 200) titulo: string;
  @IsDateString() weekStart: string;
  @IsOptional() @IsString() @Length(0, 2000) descricao?: string;
}
