import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';
import { MeetingDay } from '../../../generated/prisma/client';
import { IsEnum } from 'class-validator';

export class CreateCellDto {

  @IsString()
  @Length(3, 150)
  nome: string;


  @IsOptional()
  @IsString()
  @Length(0, 500)
  descricao?: string;


  @IsUUID()
  campusId: string;

  @IsOptional()
  @IsEnum(MeetingDay)
  meetingDay?: MeetingDay;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  meetingTime?: string;


  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

}
