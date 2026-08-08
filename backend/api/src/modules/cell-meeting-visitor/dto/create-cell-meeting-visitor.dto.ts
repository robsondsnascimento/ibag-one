import { IsEmail, IsOptional, IsString, IsUUID, Length } from 'class-validator';
export class CreateCellMeetingVisitorDto {
  @IsUUID() meetingId: string;
  @IsString() @Length(3, 150) nome: string;
  @IsString() @Length(8, 30) telefone: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @Length(0, 500) observacao?: string;
}
