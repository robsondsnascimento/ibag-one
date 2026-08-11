import { IsString, MinLength } from 'class-validator';

export class CreatePersonLoginDto {
  @IsString()
  @MinLength(6)
  password: string;
}
