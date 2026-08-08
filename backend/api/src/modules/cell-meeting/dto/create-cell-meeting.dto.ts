import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

export class CreateCellMeetingDto {
  @IsUUID()
  cellId: string;

  @IsDateString()
  data: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  tema?: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  observacoes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  visitantes?: number;
}
