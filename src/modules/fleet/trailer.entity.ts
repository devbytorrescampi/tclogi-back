import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';

export enum TrailerStatus {
  AVAILABLE = 'AVAILABLE',
  ATTACHED = 'ATTACHED',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
}

@Entity('trailers')
export class Trailer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  licensePlate: string;

  @Column({ nullable: true })
  type: string; // furgón, plataforma, refrigerado...

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  capacityKg: number | null;

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  capacityM3: number | null;

  @Column({ type: 'enum', enum: TrailerStatus, default: TrailerStatus.AVAILABLE })
  status: TrailerStatus;

  // The truck currently hitched to this trailer, if any — trailers are
  // detachable and get reassigned between trucks over time.
  @Column({ type: 'uuid', nullable: true })
  currentVehicleId: string | null;

  @ManyToOne(() => Vehicle, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'currentVehicleId' })
  currentVehicle: Vehicle | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
