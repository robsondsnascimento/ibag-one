import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsOptional, IsString, IsUUID, Length, ValidateNested } from 'class-validator';

class RosterAttendanceDto {
  @IsUUID() personId: string;
  @IsBoolean() presente: boolean;
  @IsOptional() @IsString() @Length(0, 500) observacao?: string;
}

export class SaveCellMeetingRosterDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RosterAttendanceDto)
  attendances: RosterAttendanceDto[];
}
