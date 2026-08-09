import { IsUUID } from 'class-validator';

export class TransferCellCampusCoordinationDto {
  @IsUUID()
  campusId: string;
}
