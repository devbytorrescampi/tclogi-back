import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { User } from '../users/user.entity';
import { MaintenanceRepairType, MaintenanceStatus } from './maintenance-enums';

@Entity('vehicle_maintenances')
export class VehicleMaintenance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  vehicleId: string;

  @ManyToOne(() => Vehicle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column({ type: 'uuid', nullable: true })
  responsibleUserId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'responsibleUserId' })
  responsibleUser: User | null;

  @Column({ type: 'enum', enum: MaintenanceRepairType, nullable: true })
  repairType: MaintenanceRepairType | null;

  @Column({ type: 'enum', enum: MaintenanceStatus, default: MaintenanceStatus.ACTIVE })
  status: MaintenanceStatus;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  cost: number | null;

  @Column({ type: 'timestamptz' })
  performedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  nextDueAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
