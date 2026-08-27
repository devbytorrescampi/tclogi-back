import { IsBoolean, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { PackagingLevel } from '../product-packaging.entity';

export class CreatePackagingDto {
  @IsEnum(PackagingLevel)
  level: PackagingLevel;

  // How many of the level below this one it contains (units for BOX, boxes
  // for PALLET, pallets for EQUIPMENT).
  @IsInt()
  @Min(1)
  containsQuantity: number;

  @IsOptional()
  @IsBoolean()
  isDefaultPurchaseUnit?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefaultSaleUnit?: boolean;
}
