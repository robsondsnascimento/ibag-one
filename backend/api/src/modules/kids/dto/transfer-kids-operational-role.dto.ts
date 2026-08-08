import { IsUUID } from 'class-validator'; export class TransferKidsOperationalRoleDto { @IsUUID() personId: string; }
