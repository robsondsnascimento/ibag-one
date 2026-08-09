import { Type } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, IsBoolean, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { CreateWorshipOrderTemplateItemDto } from './create-worship-order-template-item.dto';

export class CreateWorshipOrderTemplateDto {
  @IsString()
  @Length(2, 120)
  nome: string;

  @IsOptional()
  @IsBoolean()
  padrao?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique(item => item.sequencia)
  @ValidateNested({ each: true })
  @Type(() => CreateWorshipOrderTemplateItemDto)
  items: CreateWorshipOrderTemplateItemDto[];
}
