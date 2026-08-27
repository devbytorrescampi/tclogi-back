import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class ShipmentLineDto {
  @IsString()
  productId: string;

  @IsString()
  requestedUnit: string;

  @IsInt()
  @Min(1)
  requestedQuantityInUnit: number;

  @IsInt()
  @Min(1)
  quantityInBaseUnit: number;
}

export class CreateShipmentDto {
  @IsString()
  originWarehouseId: string;

  @IsString()
  destinationId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ShipmentLineDto)
  lines: ShipmentLineDto[];
}
