import { IsOptional, IsString, Length } from 'class-validator';

export class WithdrawServiceAreaApplicationDto {
  @IsOptional()
  @IsString()
  @Length(2, 1000)
  motivo?: string;
}
