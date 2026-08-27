import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TrailerStatus } from '../trailer.entity';

export class CreateTrailerDto {
  @IsString()
  licensePlate: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  capacityKg?: number;

  @IsOptional()
  @IsNumber()
  capacityM3?: number;

  @IsOptional()
  @IsEnum(TrailerStatus)
  status?: TrailerStatus;

  @IsOptional()
  @IsString()
  currentVehicleId?: string;
}
