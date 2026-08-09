import { IsString, Length } from 'class-validator';

export class SendWorshipOrderAlertDto {
  @IsString()
  @Length(3, 160)
  titulo: string;

  @IsString()
  @Length(3, 3000)
  mensagem: string;
}
