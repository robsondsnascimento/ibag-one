import { IsLatitude, IsLongitude, IsOptional, IsString, Length } from 'class-validator';
export class UpsertCellLocationDto {
  @IsString() @Length(3, 300) address: string;
  @IsOptional() @IsString() @Length(0, 100) neighborhood?: string;
  @IsString() @Length(2, 100) city: string;
  @IsString() @Length(2, 2) state: string;
  @IsOptional() @IsString() @Length(0, 15) zipCode?: string;
  @IsLatitude() latitude: number;
  @IsLongitude() longitude: number;
}
