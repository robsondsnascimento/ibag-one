import { IsOptional, IsString, IsUUID, Length } from 'class-validator';
export class ScanKidsQrDto { @IsString() @Length(10, 100) childQrCode: string; @IsUUID() responsiblePersonId: string; @IsOptional() @IsString() @Length(10, 100) pickupCode?: string; }
