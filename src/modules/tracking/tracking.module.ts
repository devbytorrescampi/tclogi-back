import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclePosition } from './vehicle-position.entity';
import { Shipment } from '../shipments/shipment.entity';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { TrackingGateway } from './tracking.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([VehiclePosition, Shipment])],
  providers: [TrackingService, TrackingGateway],
  controllers: [TrackingController],
  exports: [TypeOrmModule],
})
export class TrackingModule {}
