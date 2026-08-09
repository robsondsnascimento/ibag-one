import { Type } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

class ReorderedWorshipOrderTemplateItemDto {
  @IsUUID()
  id: string;

  @IsInt()
  @Min(1)
  sequencia: number;
}

export class ReorderWorshipOrderTemplateItemsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique(item => item.id)
  @ValidateNested({ each: true })
  @Type(() => ReorderedWorshipOrderTemplateItemDto)
  items: ReorderedWorshipOrderTemplateItemDto[];
}
