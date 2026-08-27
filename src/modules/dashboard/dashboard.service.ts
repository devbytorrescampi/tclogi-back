import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../warehouses/warehouse.entity';
import { WarehouseLocation } from '../warehouses/warehouse-location.entity';
import { Vehicle, VehicleStatus } from '../fleet/vehicle.entity';
import { Trailer, TrailerStatus } from '../fleet/trailer.entity';

const UPCOMING_WINDOW_DAYS = 7;

interface OccupancyRow {
  warehouseId: string;
  totalBins: string;
  occupiedBins: string;
}

interface MaintenanceDueRow {
  vehicleId?: string;
  trailerId?: string;
  nextDueAt: string;
  description: string;
}

export type FleetAlertReason = 'STATUS_MAINTENANCE' | 'MAINTENANCE_OVERDUE' | 'MAINTENANCE_UPCOMING';

export interface FleetAlert {
  kind: 'VEHICLE' | 'TRAILER';
  id: string;
  licensePlate: string;
  reason: FleetAlertReason;
  dueAt?: string;
  description?: string;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Warehouse) private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(WarehouseLocation)
    private readonly warehouseLocationRepo: Repository<WarehouseLocation>,
    @InjectRepository(Vehicle) private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Trailer) private readonly trailerRepo: Repository<Trailer>,
  ) {}

  private async getWarehouseOccupancy(tenantId: string) {
    const warehouses = await this.warehouseRepo.find({
      where: { tenantId, isActive: true, usesLocationHierarchy: true },
      order: { name: 'ASC' },
    });
    if (warehouses.length === 0) return [];

    const rows: OccupancyRow[] = await this.warehouseLocationRepo.manager.query(
      `SELECT
         wl."warehouseId" as "warehouseId",
         COUNT(DISTINCT wl.id) as "totalBins",
         COUNT(DISTINCT CASE WHEN bal.qty > 0 THEN wl.id END) as "occupiedBins"
       FROM warehouse_locations wl
       LEFT JOIN (
         SELECT sm."warehouseLocationId" as "locId",
           SUM(
             CASE
               WHEN sm."type" IN ('IN', 'TRANSFER_IN') THEN sm."quantityInBaseUnit"
               WHEN sm."type" IN ('OUT', 'TRANSFER_OUT') THEN -sm."quantityInBaseUnit"
               ELSE sm."quantityInBaseUnit"
             END
           ) as qty
         FROM stock_movements sm
         WHERE sm."tenantId" = $1
         GROUP BY sm."warehouseLocationId"
       ) bal ON bal."locId" = wl.id
       WHERE wl."tenantId" = $1 AND wl."type" = 'BIN'
       GROUP BY wl."warehouseId"`,
      [tenantId],
    );

    const byWarehouseId = new Map(rows.map((r) => [r.warehouseId, r]));

    return warehouses.map((w) => {
      const row = byWarehouseId.get(w.id);
      const totalBins = row ? Number(row.totalBins) : 0;
      const occupiedBins = row ? Number(row.occupiedBins) : 0;
      const occupancyPct = totalBins > 0 ? Math.round((occupiedBins / totalBins) * 100) : null;
      return {
        id: w.id,
        name: w.name,
        totalBins,
        occupiedBins,
        occupancyPct,
      };
    });
  }

  private async getFleetAlerts(tenantId: string): Promise<FleetAlert[]> {
    const now = new Date();
    const upcomingThreshold = new Date(now.getTime() + UPCOMING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    const [vehicles, trailers, vehicleDue, trailerDue] = await Promise.all([
      this.vehicleRepo.find({ where: { tenantId, status: VehicleStatus.MAINTENANCE } }),
      this.trailerRepo.find({ where: { tenantId, status: TrailerStatus.MAINTENANCE } }),
      this.vehicleRepo.manager.query(
        `SELECT DISTINCT ON (vm."vehicleId") vm."vehicleId", vm."nextDueAt", vm."description"
         FROM vehicle_maintenances vm
         WHERE vm."tenantId" = $1 AND vm."nextDueAt" IS NOT NULL
         ORDER BY vm."vehicleId", vm."performedAt" DESC`,
        [tenantId],
      ) as Promise<MaintenanceDueRow[]>,
      this.trailerRepo.manager.query(
        `SELECT DISTINCT ON (tm."trailerId") tm."trailerId", tm."nextDueAt", tm."description"
         FROM trailer_maintenances tm
         WHERE tm."tenantId" = $1 AND tm."nextDueAt" IS NOT NULL
         ORDER BY tm."trailerId", tm."performedAt" DESC`,
        [tenantId],
      ) as Promise<MaintenanceDueRow[]>,
    ]);

    const alerts: FleetAlert[] = [];

    for (const v of vehicles) {
      alerts.push({
        kind: 'VEHICLE',
        id: v.id,
        licensePlate: v.licensePlate,
        reason: 'STATUS_MAINTENANCE',
      });
    }
    for (const t of trailers) {
      alerts.push({
        kind: 'TRAILER',
        id: t.id,
        licensePlate: t.licensePlate,
        reason: 'STATUS_MAINTENANCE',
      });
    }

    const allVehicles = await this.vehicleRepo.find({ where: { tenantId } });
    const allVehiclesById = new Map(allVehicles.map((v) => [v.id, v]));
    for (const row of vehicleDue) {
      const dueAt = new Date(row.nextDueAt);
      if (dueAt > upcomingThreshold) continue;
      const vehicle = allVehiclesById.get(row.vehicleId!);
      if (!vehicle || vehicle.status === VehicleStatus.MAINTENANCE || vehicle.status === VehicleStatus.INACTIVE) {
        continue;
      }
      alerts.push({
        kind: 'VEHICLE',
        id: vehicle.id,
        licensePlate: vehicle.licensePlate,
        reason: dueAt <= now ? 'MAINTENANCE_OVERDUE' : 'MAINTENANCE_UPCOMING',
        dueAt: row.nextDueAt,
        description: row.description,
      });
    }

    const allTrailers = await this.trailerRepo.find({ where: { tenantId } });
    const allTrailersById = new Map(allTrailers.map((t) => [t.id, t]));
    for (const row of trailerDue) {
      const dueAt = new Date(row.nextDueAt);
      if (dueAt > upcomingThreshold) continue;
      const trailer = allTrailersById.get(row.trailerId!);
      if (!trailer || trailer.status === TrailerStatus.MAINTENANCE || trailer.status === TrailerStatus.INACTIVE) {
        continue;
      }
      alerts.push({
        kind: 'TRAILER',
        id: trailer.id,
        licensePlate: trailer.licensePlate,
        reason: dueAt <= now ? 'MAINTENANCE_OVERDUE' : 'MAINTENANCE_UPCOMING',
        dueAt: row.nextDueAt,
        description: row.description,
      });
    }

    return alerts;
  }

  async getSummary(tenantId: string) {
    const [warehouseOccupancy, fleetAlerts] = await Promise.all([
      this.getWarehouseOccupancy(tenantId),
      this.getFleetAlerts(tenantId),
    ]);
    return { warehouseOccupancy, fleetAlerts };
  }
}
