import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
@Index(['tenantId', 'sku'], { unique: true })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  sku: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column({ default: 'UNIT' })
  baseUnit: string;

  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  weightKg: number;

  @Column('decimal', { precision: 10, scale: 4, default: 0 })
  volumeM3: number;

  @Column({ nullable: true })
  barcode: string;

  @Column({ nullable: true })
  batchNumber: string;

  @Column({ type: 'date', nullable: true })
  expiresAt: string | null;

  @Column({ default: false })
  requiresColdChain: boolean;

  @Column({ default: false })
  hazardous: boolean;

  @Column('int', { default: 0 })
  minStockThreshold: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany('ProductPackaging', 'product')
  packagings: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
