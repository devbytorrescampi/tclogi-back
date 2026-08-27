import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Warehouse } from './warehouse.entity';

export enum WarehouseTransferStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

@Entity('warehouse_transfers')
export class WarehouseTransfer {
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
  destinationWarehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'destinationWarehouseId' })
  destinationWarehouse: Warehouse;

  @Column({ type: 'enum', enum: WarehouseTransferStatus, default: WarehouseTransferStatus.PENDING })
  status: WarehouseTransferStatus;

  @Column({ type: 'uuid', nullable: true })
  routeId: string | null;

  @OneToMany('WarehouseTransferLine', 'transfer')
  lines: any[];

  @Column({ type: 'timestamptz', nullable: true })
  dispatchedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  receivedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('warehouse_transfer_lines')
export class WarehouseTransferLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  transferId: string;

  @ManyToOne('WarehouseTransfer', 'lines', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transferId' })
  transfer: WarehouseTransfer;

  @Column()
  productId: string;

  @Column('int')
  quantityInBaseUnit: number;
}
