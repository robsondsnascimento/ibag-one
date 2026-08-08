import { IsString, Length } from 'class-validator'; export class CreateEventChecklistDto { @IsString() @Length(2, 500) descricao: string; }
