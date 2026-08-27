import { ArrayMinSize, IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateRouteDto {
  @IsDateString()
  scheduledDate: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsArray()
  @ArrayMinSize(1)
  shipmentIds: string[];
}
