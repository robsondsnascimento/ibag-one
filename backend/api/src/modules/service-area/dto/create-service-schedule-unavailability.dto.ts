import { Matches } from 'class-validator';

export class CreateServiceScheduleUnavailabilityDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'data deve usar o formato AAAA-MM-DD' })
  data: string;
}
