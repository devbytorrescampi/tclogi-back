import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Route } from './route.entity';
import { Shipment, ShipmentLine } from './shipment.entity';
import { ProofOfDelivery } from './proof-of-delivery.entity';
import { ShipmentCost, ShipmentCharge } from './shipment-cost.entity';
import { Destination } from '../destinations/destination.entity';
import { StockMovement } from '../warehouses/stock-movement.entity';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Route,
      Shipment,
      ShipmentLine,
      ProofOfDelivery,
      ShipmentCost,
      ShipmentCharge,
      Destination,
      StockMovement,
    ]),
  ],
  providers: [ShipmentsService],
  controllers: [ShipmentsController],
  exports: [TypeOrmModule],
})
export class ShipmentsModule {}
