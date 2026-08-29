import { EventRecurrence, EventType } from '../../../generated/prisma/client';
import { ArrayUnique, IsArray, IsBoolean, IsDateString, IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
export class CreateEventDto {
  @IsString() @Length(3, 180) titulo: string;
  @IsOptional() @IsString() @Length(3, 3000) descricao?: string;
  @IsEnum(EventType) type: EventType;
  @IsUUID() campusId: string;
  @IsOptional() @IsUUID() cellId?: string;
  @IsDateString() inicio: string;
  @IsDateString() fim: string;
  @IsOptional() @IsUUID() responsiblePersonId?: string;
  @IsOptional() @IsBoolean() alertEnabled?: boolean;
  @IsOptional() @IsBoolean() blocksCampusAgenda?: boolean;
  @IsOptional() @IsEnum(EventRecurrence) recurrence?: EventRecurrence;
  @IsOptional() @IsDateString() recurrenceUntil?: string;
  @IsOptional() @IsArray() @ArrayUnique() @IsUUID('4', { each: true }) spaceIds?: string[];
  @IsOptional() @IsArray() @ArrayUnique() @IsUUID('4', { each: true }) serviceAreaIds?: string[];
  @IsOptional() @IsArray() @ArrayUnique() @IsUUID('4', { each: true }) teamIds?: string[];
}
