import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Warehouse } from '../warehouses/warehouse.entity';
import { Destination } from '../destinations/destination.entity';
import { Route } from './route.entity';

export enum ShipmentStatus {
  PREPARING = 'PREPARING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  INCIDENT = 'INCIDENT',
}

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  originWarehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'originWarehouseId' })
  originWarehouse: Warehouse;

  @Column()
  destinationId: string;

  @ManyToOne(() => Destination)
  @JoinColumn({ name: 'destinationId' })
  destination: Destination;

  @Column({ type: 'uuid', nullable: true })
  routeId: string | null;

  @ManyToOne(() => Route, (route) => route.shipments, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'routeId' })
  route: Route | null;

  @Column({ type: 'enum', enum: ShipmentStatus, default: ShipmentStatus.PREPARING })
  status: ShipmentStatus;

  @OneToMany('ShipmentLine', 'shipment')
  lines: any[];

  @OneToOne('ProofOfDelivery', 'shipment')
  proofOfDelivery: any;

  @OneToOne('ShipmentCost', 'shipment')
  cost: any;

  @OneToOne('ShipmentCharge', 'shipment')
  charge: any;

  @Column({ type: 'timestamptz', nullable: true })
  dispatchedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  deliveredAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('shipment_lines')
export class ShipmentLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shipmentId: string;

  @ManyToOne('Shipment', 'lines', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipmentId' })
  shipment: Shipment;

  @Column()
  productId: string;

  @Column()
  requestedUnit: string; // 'UNIT' | 'BOX' | 'PALLET'

  @Column('int')
  requestedQuantityInUnit: number;

  @Column('int')
  quantityInBaseUnit: number;
}
