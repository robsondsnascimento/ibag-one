import { IsString, Length } from 'class-validator'; export class CreateFamilyDto { @IsString() @Length(3,150) nome: string; }
