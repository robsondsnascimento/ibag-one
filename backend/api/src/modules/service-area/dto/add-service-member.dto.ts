import { ServiceMembershipRole } from '../../../generated/prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

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
}
