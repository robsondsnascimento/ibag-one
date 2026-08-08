import { IsBoolean, IsOptional, IsString, IsUUID, Length } from 'class-validator';
export class CreateCellMeetingAttendanceDto {
  @IsUUID() meetingId: string;
  @IsUUID() personId: string;
  @IsOptional() @IsBoolean() presente?: boolean;
  @IsOptional() @IsString() @Length(0, 500) observacao?: string;
}
