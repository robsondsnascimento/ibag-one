import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateServiceScheduleDto } from './create-service-schedule.dto';

export class CreateServiceScheduleBatchDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CreateServiceScheduleDto)
  schedules: CreateServiceScheduleDto[];
}
