import { IsUUID } from 'class-validator';

export class TransferCellNetworkSupervisionDto {

  @IsUUID()
  networkId: string;

}
