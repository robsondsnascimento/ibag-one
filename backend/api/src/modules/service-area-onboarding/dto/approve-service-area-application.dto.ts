import { IsUUID } from 'class-validator';

export class ApproveServiceAreaApplicationDto {
  @IsUUID()
  teamId: string;
}
