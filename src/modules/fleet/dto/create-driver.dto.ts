import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  dni?: string;

  @IsOptional()
  @IsString()
  licenseType?: string;

  @IsOptional()
  @IsDateString()
  licenseExpiresAt?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
