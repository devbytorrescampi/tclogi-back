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
import { WarehouseLocation } from './warehouse-location.entity';
import { Product } from '../products/product.entity';

export enum StockMovementType {
  IN = 'IN', // recepción
  OUT = 'OUT', // salida por shipment
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER_OUT = 'TRANSFER_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
}

@Entity('stock_movements')
@Index(['tenantId', 'productId', 'warehouseId'])
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  warehouseId: string;

  @ManyToOne(() => Warehouse, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ type: 'uuid', nullable: true })
  warehouseLocationId: string | null;

  @ManyToOne(() => WarehouseLocation, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'warehouseLocationId' })
  warehouseLocation: WarehouseLocation | null;

  @Column({ type: 'enum', enum: StockMovementType })
  type: StockMovementType;

  @Column('int')
  quantityInBaseUnit: number;

  @Column({ nullable: true })
  referenceType: string; // 'INBOUND_RECEIPT' | 'SHIPMENT' | 'WAREHOUSE_TRANSFER' | 'MANUAL'

  @Column({ nullable: true })
  referenceId: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
