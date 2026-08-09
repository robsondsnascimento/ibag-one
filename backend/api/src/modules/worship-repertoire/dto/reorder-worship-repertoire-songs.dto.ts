import { Type } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

class ReorderedWorshipRepertoireSongDto {
  @IsUUID()
  id: string;

  @IsInt()
  @Min(1)
  sequencia: number;
}

export class ReorderWorshipRepertoireSongsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique(song => song.id)
  @ValidateNested({ each: true })
  @Type(() => ReorderedWorshipRepertoireSongDto)
  songs: ReorderedWorshipRepertoireSongDto[];
}
