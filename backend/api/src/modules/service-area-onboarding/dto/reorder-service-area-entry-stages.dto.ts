import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class ReorderServiceAreaEntryStagesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  stageIds: string[];
}
