import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Shipment } from './shipment.entity';

// Internal costing — always recorded, used for profitability analysis.
@Entity('shipment_costs')
export class ShipmentCost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  shipmentId: string;

  @OneToOne(() => Shipment, (shipment) => shipment.cost, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipmentId' })
  shipment: Shipment;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  fuelCost: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  driverCost: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  otherCost: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  distanceKm: number | null;

  @Column('decimal', { precision: 12, scale: 2 })
  totalCost: number;

  @CreateDateColumn()
  createdAt: Date;
}

// Only created when Destination.shippingChargeable = true — the amount passed on to the client.
@Entity('shipment_charges')
export class ShipmentCharge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  shipmentId: string;

  @OneToOne(() => Shipment, (shipment) => shipment.charge, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipmentId' })
  shipment: Shipment;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ default: 'PENDING' })
  billingStatus: string; // PENDING | INVOICED | PAID

  @CreateDateColumn()
  createdAt: Date;
}
