import {
  IsUUID,
} from 'class-validator';

export class CreateCellLeadershipDto {

  @IsUUID()
  personId: string;

  @IsUUID()
  cellId: string;

}
