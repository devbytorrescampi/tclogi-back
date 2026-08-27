import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vehicle } from '../fleet/vehicle.entity';

@Entity('vehicle_positions')
@Index(['vehicleId', 'recordedAt'])
export class VehiclePosition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  vehicleId: string;

  @ManyToOne(() => Vehicle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column('decimal', { precision: 10, scale: 7 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 7 })
  longitude: number;

  @Column('decimal', { precision: 6, scale: 2, nullable: true })
  speedKmh: number | null;

  @Column('decimal', { precision: 6, scale: 2, nullable: true })
  heading: number | null;

  @Column({ type: 'timestamptz' })
  recordedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
