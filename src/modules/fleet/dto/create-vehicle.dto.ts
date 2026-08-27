import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { VehicleStatus } from '../vehicle.entity';

export class CreateVehicleDto {
  @IsString()
  licensePlate: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number;

  @IsOptional()
  @IsNumber()
  capacityKg?: number;

  @IsOptional()
  @IsNumber()
  capacityM3?: number;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @IsOptional()
  @IsString()
  gpsDeviceId?: string;

  @IsOptional()
  @IsString()
  currentDriverId?: string;
}
