import { ArrayMaxSize, IsArray, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class TransferServiceMembershipDto {
  @IsUUID()
  serviceAreaId: string;

  @IsUUID()
  teamId: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @Length(2, 100, { each: true })
  funcoes?: string[];
}
