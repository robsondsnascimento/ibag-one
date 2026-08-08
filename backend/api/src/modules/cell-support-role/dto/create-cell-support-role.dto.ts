import { IsEnum, IsUUID } from 'class-validator';
import { CellSupportRoleType } from '../../../generated/prisma/client';
export class CreateCellSupportRoleDto { @IsUUID() personId: string; @IsUUID() cellId: string; @IsEnum(CellSupportRoleType) role: CellSupportRoleType; }
