import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Shipment, ShipmentLine, ShipmentStatus } from './shipment.entity';
import { Route, RouteStatus } from './route.entity';
import { ProofOfDelivery } from './proof-of-delivery.entity';
import { ShipmentCost, ShipmentCharge } from './shipment-cost.entity';
import { StockMovement, StockMovementType } from '../warehouses/stock-movement.entity';
import { Destination } from '../destinations/destination.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { CreateRouteDto } from './dto/create-route.dto';
import { ProofOfDeliveryDto } from './dto/proof-of-delivery.dto';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment) private readonly shipmentRepo: Repository<Shipment>,
    @InjectRepository(Route) private readonly routeRepo: Repository<Route>,
    @InjectRepository(Destination)
    private readonly destinationRepo: Repository<Destination>,
    private readonly dataSource: DataSource,
  ) {}

  async createShipment(tenantId: string, dto: CreateShipmentDto) {
    return this.dataSource.transaction(async (manager) => {
      const shipment = await manager.save(Shipment, {
        tenantId,
        originWarehouseId: dto.originWarehouseId,
        destinationId: dto.destinationId,
        status: ShipmentStatus.PREPARING,
      });

      for (const line of dto.lines) {
        await manager.save(ShipmentLine, {
          shipmentId: shipment.id,
          productId: line.productId,
          requestedUnit: line.requestedUnit,
          requestedQuantityInUnit: line.requestedQuantityInUnit,
          quantityInBaseUnit: line.quantityInBaseUnit,
        });
      }

      return shipment;
    });
  }

  findAll(tenantId: string) {
    return this.shipmentRepo.find({
      where: { tenantId },
      relations: { lines: true, destination: true, route: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const shipment = await this.shipmentRepo.findOne({
      where: { id, tenantId },
      relations: {
        lines: true,
        destination: true,
        route: true,
        proofOfDelivery: true,
        cost: true,
        charge: true,
      },
    });
    if (!shipment) throw new NotFoundException('Envío no encontrado');
    return shipment;
  }

  async createRoute(tenantId: string, dto: CreateRouteDto) {
    return this.dataSource.transaction(async (manager) => {
      const route = await manager.save(Route, {
        tenantId,
        scheduledDate: dto.scheduledDate,
        vehicleId: dto.vehicleId ?? null,
        driverId: dto.driverId ?? null,
        status: RouteStatus.PLANNED,
      });

      for (const shipmentId of dto.shipmentIds) {
        await manager.update(
          Shipment,
          { id: shipmentId, tenantId },
          { routeId: route.id },
        );
      }

      return route;
    });
  }

  async dispatchRoute(tenantId: string, routeId: string) {
    return this.dataSource.transaction(async (manager) => {
      const route = await manager.findOne(Route, {
        where: { id: routeId, tenantId },
        relations: { shipments: { lines: true } },
      });
      if (!route) throw new NotFoundException('Ruta no encontrada');

      const now = new Date();
      route.status = RouteStatus.DISPATCHED;
      route.dispatchedAt = now;
      await manager.save(Route, route);

      for (const shipment of route.shipments) {
        shipment.status = ShipmentStatus.IN_TRANSIT;
        shipment.dispatchedAt = now;
        await manager.save(Shipment, shipment);

        for (const line of shipment.lines) {
          await manager.save(StockMovement, {
            tenantId,
            productId: line.productId,
            warehouseId: shipment.originWarehouseId,
            type: StockMovementType.OUT,
            quantityInBaseUnit: line.quantityInBaseUnit,
            referenceType: 'SHIPMENT',
            referenceId: shipment.id,
          });
        }
      }

      return route;
    });
  }

  async deliverShipment(
    tenantId: string,
    shipmentId: string,
    podDto: ProofOfDeliveryDto,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const shipment = await manager.findOne(Shipment, {
        where: { id: shipmentId, tenantId },
        relations: { destination: true },
      });
      if (!shipment) throw new NotFoundException('Envío no encontrado');

      shipment.status = ShipmentStatus.DELIVERED;
      shipment.deliveredAt = new Date();
      await manager.save(Shipment, shipment);

      await manager.save(ProofOfDelivery, {
        tenantId,
        shipmentId: shipment.id,
        ...podDto,
      });

      return shipment;
    });
  }

  async recordCost(
    tenantId: string,
    shipmentId: string,
    cost: {
      fuelCost?: number;
      driverCost?: number;
      otherCost?: number;
      distanceKm?: number;
    },
  ) {
    const shipment = await this.shipmentRepo.findOne({
      where: { id: shipmentId, tenantId },
      relations: { destination: true },
    });
    if (!shipment) throw new NotFoundException('Envío no encontrado');

    const fuelCost = cost.fuelCost ?? 0;
    const driverCost = cost.driverCost ?? 0;
    const otherCost = cost.otherCost ?? 0;
    const totalCost = fuelCost + driverCost + otherCost;

    return this.dataSource.transaction(async (manager) => {
      const savedCost = await manager.save(ShipmentCost, {
        tenantId,
        shipmentId,
        fuelCost,
        driverCost,
        otherCost,
        distanceKm: cost.distanceKm ?? null,
        totalCost,
      });

      // Only pass the cost on to the client when the destination is set up to be charged.
      if (shipment.destination?.shippingChargeable) {
        await manager.save(ShipmentCharge, {
          tenantId,
          shipmentId,
          amount: totalCost,
          billingStatus: 'PENDING',
        });
      }

      return savedCost;
    });
  }
}
