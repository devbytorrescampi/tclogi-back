import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from './warehouse.entity';
import { WarehouseLocation } from './warehouse-location.entity';
import { StockMovement } from './stock-movement.entity';
import {
  WarehouseTransfer,
  WarehouseTransferLine,
} from './warehouse-transfer.entity';
import { WarehousesService } from './warehouses.service';
import { WarehousesController } from './warehouses.controller';
import { WarehouseLocationsService } from './warehouse-locations.service';
import { WarehouseLocationsController } from './warehouse-locations.controller';
import { WarehouseTransfersService } from './warehouse-transfers.service';
import { WarehouseTransfersController } from './warehouse-transfers.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Warehouse,
      WarehouseLocation,
      StockMovement,
      WarehouseTransfer,
      WarehouseTransferLine,
    ]),
    SubscriptionsModule,
  ],
  providers: [WarehousesService, WarehouseLocationsService, WarehouseTransfersService],
  controllers: [
    WarehousesController,
    WarehouseLocationsController,
    WarehouseTransfersController,
  ],
  exports: [TypeOrmModule],
})
export class WarehousesModule {}
