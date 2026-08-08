import { IsInt, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';
export class CreateKidsClassDto { @IsString() @Length(2, 120) nome: string; @IsUUID() campusId: string; @IsOptional() @IsUUID() spaceId?: string; @IsOptional() @IsInt() @Min(0) idadeMinima?: number; @IsOptional() @IsInt() @Min(0) idadeMaxima?: number; }
