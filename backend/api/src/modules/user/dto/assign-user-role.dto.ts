import { IsEnum } from 'class-validator';
import { UserRole } from '../../../generated/prisma/client';

export class AssignUserRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}
