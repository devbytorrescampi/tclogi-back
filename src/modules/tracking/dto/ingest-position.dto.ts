import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class IngestPositionDto {
  @IsString()
  vehicleId: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  speedKmh?: number;

  @IsOptional()
  @IsNumber()
  heading?: number;

  @IsDateString()
  recordedAt: string;
}
