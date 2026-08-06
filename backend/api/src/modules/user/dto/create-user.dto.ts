import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateUserDto {

  @IsUUID()
  @IsNotEmpty()
  personId: string;


  @IsString()
  @MinLength(6)
  password: string;

}
