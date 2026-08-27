import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export enum AddStockType {
  IN = 'IN',
  ADJUSTMENT = 'ADJUSTMENT',
}

export class AddStockDto {
  @IsString()
  warehouseId: string;

  @IsOptional()
  @IsString()
  warehouseLocationId?: string;

  // Positive to add stock. When type = ADJUSTMENT this may also be negative
  // (e.g. to correct a count or write off damaged/lost goods).
  @IsInt()
  quantityInBaseUnit: number;

  @IsOptional()
  @IsEnum(AddStockType)
  type?: AddStockType;

  @IsOptional()
  @IsString()
  notes?: string;
}
