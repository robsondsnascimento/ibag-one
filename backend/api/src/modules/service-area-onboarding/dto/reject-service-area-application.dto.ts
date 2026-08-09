import { IsString, Length } from 'class-validator';

export class RejectServiceAreaApplicationDto {
  @IsString()
  @Length(2, 1000)
  motivo: string;
}
