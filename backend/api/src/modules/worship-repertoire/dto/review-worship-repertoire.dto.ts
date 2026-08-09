import { IsOptional, IsString, Length } from 'class-validator';

export class ReturnWorshipRepertoireDto {
  @IsString()
  @Length(3, 1500)
  comentario: string;
}

export class ApproveWorshipRepertoireDto {
  @IsOptional()
  @IsString()
  @Length(3, 1500)
  comentario?: string;
}
