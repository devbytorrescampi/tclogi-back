import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Warehouse } from './warehouse.entity';

export enum WarehouseLocationType {
  RACK = 'RACK', // rack metálico, soporta los estantes
  SHELF = 'SHELF', // estante
  BIN = 'BIN', // posición/lugar final, donde vive el stock
}

@Entity('warehouse_locations')
@Index(['warehouseId', 'fullPath'], { unique: true })
export class WarehouseLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  warehouseId: string;

  @ManyToOne(() => Warehouse, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ type: 'uuid', nullable: true })
  parentLocationId: string | null;

  @ManyToOne(() => WarehouseLocation, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentLocationId' })
  parentLocation: WarehouseLocation | null;

  @Column({ type: 'enum', enum: WarehouseLocationType })
  type: WarehouseLocationType;

  @Column()
  code: string; // e.g. "A", "3", "B2"

  @Column()
  fullPath: string; // denormalized, e.g. "A-3-B2"

  @CreateDateColumn()
  createdAt: Date;
}
