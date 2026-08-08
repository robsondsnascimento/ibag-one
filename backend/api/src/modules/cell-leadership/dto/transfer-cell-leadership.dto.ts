import {
  IsUUID,
} from 'class-validator';

export class TransferCellLeadershipDto {

  @IsUUID()
  cellId: string;

}
