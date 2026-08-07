import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  loginEmail: string;

  @IsString()
  @MinLength(6)
  password: string;
}
