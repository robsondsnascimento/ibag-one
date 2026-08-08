import { IsEnum, IsOptional, IsString, IsUUID, Length, Matches } from 'class-validator';
import { MeetingDay } from '../../../generated/prisma/client';
export class CreateCellMultiplicationDto { @IsUUID() sourceCellId: string; @IsString() @Length(3,150) newCellName: string; @IsOptional() @IsEnum(MeetingDay) meetingDay?: MeetingDay; @IsOptional() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) meetingTime?: string; @IsOptional() @IsString() @Length(0,500) observacao?: string; }
