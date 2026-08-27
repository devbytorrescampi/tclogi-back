import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehiclePosition } from './vehicle-position.entity';
import { Shipment, ShipmentStatus } from '../shipments/shipment.entity';
import { IngestPositionDto } from './dto/ingest-position.dto';
import { TrackingGateway } from './tracking.gateway';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(VehiclePosition)
    private readonly positionRepo: Repository<VehiclePosition>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    private readonly trackingGateway: TrackingGateway,
  ) {}

  async ingest(tenantId: string, dto: IngestPositionDto) {
    const position = await this.positionRepo.save(
      this.positionRepo.create({ ...dto, tenantId }),
    );
    this.trackingGateway.emitPositionUpdate(position);
    return position;
  }

  async getVehicleLastPosition(tenantId: string, vehicleId: string) {
    return this.positionRepo.findOne({
      where: { tenantId, vehicleId },
      order: { recordedAt: 'DESC' },
    });
  }

  // Resolves static (warehouse) vs dynamic (live vehicle GPS) location
  // depending on the shipment's current status.
  async getShipmentLocation(tenantId: string, shipmentId: string) {
    const shipment = await this.shipmentRepo.findOne({
      where: { id: shipmentId, tenantId },
      relations: {
        originWarehouse: true,
        destination: true,
        route: { vehicle: true },
      },
    });
    if (!shipment) throw new NotFoundException('Envío no encontrado');

    if (shipment.status === ShipmentStatus.PREPARING) {
      return {
        type: 'STATIC_WAREHOUSE' as const,
        warehouse: shipment.originWarehouse,
      };
    }

    if (shipment.status === ShipmentStatus.IN_TRANSIT && shipment.route?.vehicle) {
      const lastPosition = await this.getVehicleLastPosition(
        tenantId,
        shipment.route.vehicle.id,
      );
      return { type: 'DYNAMIC_VEHICLE' as const, position: lastPosition };
    }

    if (shipment.status === ShipmentStatus.DELIVERED) {
      return {
        type: 'DELIVERED' as const,
        destination: shipment.destination,
        deliveredAt: shipment.deliveredAt,
      };
    }

    return { type: 'UNKNOWN' as const };
  }
}
