import { IsBoolean, IsEnum, IsLatitude, IsLongitude, IsOptional, IsString } from 'class-validator';
import { DestinationType } from '../destination.entity';

export class CreateDestinationDto {
  @IsEnum(DestinationType)
  type: DestinationType;

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
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsBoolean()
  shippingChargeable?: boolean;
}
