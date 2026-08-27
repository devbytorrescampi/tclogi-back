import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from '../warehouses/warehouse.entity';
import { WarehouseLocation } from '../warehouses/warehouse-location.entity';
import { Vehicle } from '../fleet/vehicle.entity';
import { Trailer } from '../fleet/trailer.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse, WarehouseLocation, Vehicle, Trailer])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
