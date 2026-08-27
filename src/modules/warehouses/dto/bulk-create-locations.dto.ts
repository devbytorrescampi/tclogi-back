import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { WarehouseLocationType } from '../warehouse-location.entity';

export enum LocationCodeStyle {
  NUMERIC = 'numeric',
  ALPHA = 'alpha',
  CUSTOM = 'custom',
}

export class BulkCreateLocationsDto {
  @IsEnum(WarehouseLocationType)
  type: WarehouseLocationType;

  @IsOptional()
  @IsString()
  parentLocationId?: string;

  // When true, applies `count` new children to EVERY existing location of the
  // required parent type (e.g. add N shelves to every rack in one call).
  @IsOptional()
  @IsBoolean()
  applyToAllParents?: boolean;

  // Ignored when codeStyle = CUSTOM (customCodes.length is used instead).
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  count?: number;

  @IsOptional()
  @IsEnum(LocationCodeStyle)
  codeStyle?: LocationCodeStyle;

  // Required when codeStyle = CUSTOM — explicit codes to use, in order,
  // applied to each target parent (e.g. ["Norte", "Sur", "Este"]).
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsString({ each: true })
  customCodes?: string[];
}
