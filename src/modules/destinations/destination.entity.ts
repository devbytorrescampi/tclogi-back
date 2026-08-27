import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DestinationType {
  BRANCH = 'BRANCH', // sucursal propia
  EXTERNAL_CLIENT = 'EXTERNAL_CLIENT', // cliente B2B/B2C
}

@Entity('destinations')
export class Destination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column({ type: 'enum', enum: DestinationType })
  type: DestinationType;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Column({ nullable: true })
  contactName: string;

  @Column({ nullable: true })
  contactPhone: string;

  // Only relevant when type = EXTERNAL_CLIENT
  @Column({ default: false })
  shippingChargeable: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
