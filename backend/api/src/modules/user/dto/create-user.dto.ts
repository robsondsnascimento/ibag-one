import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateUserDto {

  @IsUUID()
  personId: string;

  @IsUUID()
  organizationId: string;

  @IsString()
  @MinLength(6)
  password: string;

}
