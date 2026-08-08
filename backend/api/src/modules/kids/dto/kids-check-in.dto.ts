import { IsUUID } from 'class-validator'; export class KidsCheckInDto { @IsUUID() childId: string; @IsUUID() responsiblePersonId: string; }
