import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsString, Min, ValidateNested } from 'class-validator';

class TransferLineDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantityInBaseUnit: number;
}

export class CreateWarehouseTransferDto {
  @IsString()
  originWarehouseId: string;

  @IsString()
  destinationWarehouseId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TransferLineDto)
  lines: TransferLineDto[];
}
