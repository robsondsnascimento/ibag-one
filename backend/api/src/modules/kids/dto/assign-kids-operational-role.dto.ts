import { KidsOperationalRole } from '../../../generated/prisma/client'; import { IsEnum, IsUUID } from 'class-validator';
export class AssignKidsOperationalRoleDto { @IsUUID() personId: string; @IsUUID() campusId: string; @IsEnum(KidsOperationalRole) role: KidsOperationalRole; }
