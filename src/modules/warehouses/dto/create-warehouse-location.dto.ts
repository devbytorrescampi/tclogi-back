import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WarehouseLocationType } from '../warehouse-location.entity';

export class CreateWarehouseLocationDto {
  @IsEnum(WarehouseLocationType)
  type: WarehouseLocationType;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  parentLocationId?: string;
}
