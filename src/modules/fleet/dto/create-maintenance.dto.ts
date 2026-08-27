import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { MaintenanceRepairType, MaintenanceStatus } from '../maintenance-enums';

export class CreateMaintenanceDto {
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsDateString()
  performedAt: string;

  @IsOptional()
  @IsDateString()
  nextDueAt?: string;

  @IsOptional()
  @IsString()
  responsibleUserId?: string;

  @IsOptional()
  @IsEnum(MaintenanceRepairType)
  repairType?: MaintenanceRepairType;

  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;
}
