import { Type } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

class ReorderedItemDto {
  @IsUUID()
  id: string;

  @IsInt()
  @Min(1)
  sequencia: number;
}

export class ReorderWorshipOrderItemsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique(item => item.id)
  @ValidateNested({ each: true })
  @Type(() => ReorderedItemDto)
  items: ReorderedItemDto[];
}
