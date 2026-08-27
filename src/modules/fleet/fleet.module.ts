import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './vehicle.entity';
import { VehicleMaintenance } from './vehicle-maintenance.entity';
import { VehicleType } from './vehicle-type.entity';
import { Driver } from './driver.entity';
import { DriverLicenseType } from './driver-license-type.entity';
import { Trailer } from './trailer.entity';
import { TrailerMaintenance } from './trailer-maintenance.entity';
import { TrailerType } from './trailer-type.entity';
import { FleetService } from './fleet.service';
import { FleetController } from './fleet.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehicle,
      VehicleMaintenance,
      VehicleType,
      Driver,
      DriverLicenseType,
      Trailer,
      TrailerMaintenance,
      TrailerType,
    ]),
    SubscriptionsModule,
  ],
  providers: [FleetService],
  controllers: [FleetController],
  exports: [TypeOrmModule],
})
export class FleetModule {}
