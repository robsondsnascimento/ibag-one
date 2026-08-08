import { IsUUID } from 'class-validator'; export class EnrollKidDto { @IsUUID() childId: string; }
