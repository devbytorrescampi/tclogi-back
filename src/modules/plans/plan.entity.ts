import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BillingCycle } from '../../common/enums/subscription-status.enum';

export interface PlanFeatures {
  maxUsers: number;
  maxWarehouses: number;
  maxVehicles: number;
  maxShipmentsPerMonth: number;
  hasCustomsModule: boolean;
  hasMultiWarehouseTransfers: boolean;
  hasRealtimeTracking: boolean;
  hasReports: boolean;
}

@Entity('subscription_plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  priceUsd: number;

  @Column({ type: 'enum', enum: BillingCycle, default: BillingCycle.MONTHLY })
  billingCycle: BillingCycle;

  @Column('jsonb')
  features: PlanFeatures;

  @Column({ default: 14 })
  trialDays: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  isVisible: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ nullable: true })
  paypalPlanId: string;

  @Column({ nullable: true })
  mpPlanId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
