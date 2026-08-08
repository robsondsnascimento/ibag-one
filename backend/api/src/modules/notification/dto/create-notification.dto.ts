import { NotificationAudience } from '../../../generated/prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
export class CreateNotificationDto { @IsString() @Length(3, 180) titulo: string; @IsString() @Length(3, 3000) mensagem: string; @IsEnum(NotificationAudience) audience: NotificationAudience; @IsOptional() @IsUUID() campusId?: string; @IsOptional() @IsUUID() serviceAreaId?: string; @IsOptional() @IsUUID() serviceTeamId?: string; @IsOptional() @IsUUID() personId?: string; @IsOptional() @IsUUID() eventId?: string; }
