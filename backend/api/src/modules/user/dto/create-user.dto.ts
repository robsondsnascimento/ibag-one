import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateUserDto {

  @IsUUID()
  personId: string;

  @IsString()
  @MinLength(6)
  password: string;

}
