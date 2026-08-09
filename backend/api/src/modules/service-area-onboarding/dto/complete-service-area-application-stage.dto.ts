import { IsOptional, IsString, Length } from 'class-validator';

export class CompleteServiceAreaApplicationStageDto {
  @IsOptional()
  @IsString()
  @Length(2, 1000)
  observacao?: string;
}
