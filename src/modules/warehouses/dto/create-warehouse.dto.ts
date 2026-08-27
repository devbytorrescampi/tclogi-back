import { IsBoolean, IsLatitude, IsLongitude, IsOptional, IsString } from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  usesLocationHierarchy?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
