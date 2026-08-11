import { ServiceMembershipRole } from '../../../generated/prisma/client';
import { ArrayMaxSize, IsArray, IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class AddServiceMemberDto {
  @IsUUID()
  personId: string;

  @IsEnum(ServiceMembershipRole)
  role: ServiceMembershipRole;

  @IsOptional()
  @IsUUID()
  campusId?: string;

  @IsOptional()
  @IsUUID()
  teamId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @Length(2, 100, { each: true })
  funcoes?: string[];
}
