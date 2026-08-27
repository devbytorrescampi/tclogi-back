import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

// Fixed packaging hierarchy, from smallest to largest. The base "unidad
// suelta" isn't a row here — it's the product itself (always = 1).
export enum PackagingLevel {
  BOX = 'BOX', // caja
  PALLET = 'PALLET', // pallet, made of N boxes
  EQUIPMENT = 'EQUIPMENT', // equipo (semi/acoplado completo), made of N pallets
}

export const PACKAGING_LEVEL_ORDER = [
  PackagingLevel.BOX,
  PackagingLevel.PALLET,
  PackagingLevel.EQUIPMENT,
];

@Entity('product_packagings')
@Index(['productId', 'level'], { unique: true })
export class ProductPackaging {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.packagings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  level: PackagingLevel;

  // How many of the level directly below this one it contains — e.g. a BOX's
  // containsQuantity is a count of loose units; a PALLET's is a count of
  // boxes; an EQUIPMENT's is a count of pallets.
  @Column('int')
  containsQuantity: number;

  // Denormalized total in loose units, recomputed whenever any level in the
  // chain changes — so stock math never has to walk the hierarchy itself.
  @Column('int')
  quantityInBaseUnit: number;

  @Column({ default: false })
  isDefaultPurchaseUnit: boolean;

  @Column({ default: false })
  isDefaultSaleUnit: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
