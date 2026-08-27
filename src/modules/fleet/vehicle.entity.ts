import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Driver } from './driver.entity';

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  ON_ROUTE = 'ON_ROUTE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  licensePlate: string;

  @Column({ nullable: true })
  type: string; // truck, van, motorcycle...

  @Column({ nullable: true })
  model: string;

  @Column({ type: 'int', nullable: true })
  year: number | null;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  capacityKg: number | null;

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  capacityM3: number | null;

  @Column({ type: 'enum', enum: VehicleStatus, default: VehicleStatus.AVAILABLE })
  status: VehicleStatus;

  @Column({ nullable: true })
  gpsDeviceId: string; // external tracking provider device identifier

  // The driver currently assigned to this vehicle by default — separate from
  // per-route driverId, which can differ trip to trip.
  @Column({ type: 'uuid', nullable: true })
  currentDriverId: string | null;

  @ManyToOne(() => Driver, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'currentDriverId' })
  currentDriver: Driver | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
