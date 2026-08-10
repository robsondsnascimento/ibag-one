import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  loginEmail: string;

  @IsString()
  @MinLength(6)
  password: string;
}
