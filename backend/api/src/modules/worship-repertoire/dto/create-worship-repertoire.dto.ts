import { Type } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, IsUUID, ValidateNested } from 'class-validator';
import { CreateWorshipRepertoireSongDto } from './create-worship-repertoire-song.dto';

export class CreateWorshipRepertoireDto {
  @IsUUID()
  eventId: string;

  @IsUUID()
  serviceAreaId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique(song => song.sequencia)
  @ValidateNested({ each: true })
  @Type(() => CreateWorshipRepertoireSongDto)
  songs: CreateWorshipRepertoireSongDto[];
}
