import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateStockMovementDto {
  @IsOptional()
  @IsInt()
  quantityInBaseUnit?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
