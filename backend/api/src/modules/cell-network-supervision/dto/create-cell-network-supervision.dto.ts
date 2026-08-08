import { IsUUID } from 'class-validator';

export class CreateCellNetworkSupervisionDto {

  @IsUUID()
  personId: string;

  @IsUUID()
  networkId: string;

}
