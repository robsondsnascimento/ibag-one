import { IsDateString, IsOptional, IsString, IsUUID, Length } from 'class-validator';
export class CreatePastoralCareDto {
  @IsUUID() subjectPersonId: string;
  @IsUUID() responsiblePersonId: string;
  @IsString() @Length(3, 4000) descricao: string;
  @IsOptional() @IsString() @Length(0, 1000) proximoPasso?: string;
  @IsOptional() @IsDateString() dueDate?: string;
}
