import { ServiceOperationalRole } from '../../../generated/prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

export class AssignServiceOperationalRoleDto {
  @IsUUID()
  personId: string;

  @IsEnum(ServiceOperationalRole)
  role: ServiceOperationalRole;
}
