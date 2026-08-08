import { IsInt, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateSpaceDto {
  @IsString() @Length(2, 150) nome: string;
  @IsUUID() campusId: string;
  @IsOptional() @IsInt() @Min(1) capacidade?: number;
  @IsOptional() @IsString() @Length(2, 1000) recursos?: string;
}
