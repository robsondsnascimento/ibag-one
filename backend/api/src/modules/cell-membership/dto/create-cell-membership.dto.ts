import {
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateCellMembershipDto {

  @IsUUID()
  personId: string;

  @IsUUID()
  cellId: string;

  @IsOptional()
  @IsBoolean()
  confirmTransfer?: boolean;

}
