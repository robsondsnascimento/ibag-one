import { IsUUID } from 'class-validator';

export class CreateCellCampusCoordinationDto {
  @IsUUID()
  personId: string;

  @IsUUID()
  campusId: string;
}
