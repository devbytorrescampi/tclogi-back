import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Plan } from '../plans/plan.entity';
import { SubscriptionStatus } from '../../common/enums/subscription-status.enum';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.subscriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  planId: string;

  @ManyToOne(() => Plan, { eager: true })
  @JoinColumn({ name: 'planId' })
  plan: Plan;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.TRIAL })
  status: SubscriptionStatus;

  @Column({ type: 'timestamptz', nullable: true })
  trialEndsAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  currentPeriodEnd: Date | null;

  @Column({ default: false })
  cancelAtPeriodEnd: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @Column({ nullable: true })
  pauseReason: string;

  @Column({ nullable: true })
  paypalSubscriptionId: string;

  @Column({ nullable: true })
  mpPreapprovalId: string;

  // Última vez que CoreJwtStrategy trajo esta fila desde Core
  // (GET /subscriptions/me) — Core es la fuente de verdad de plan/estado
  // desde la migración a Core-only auth; esto es un mirror de solo-lectura
  // con TTL corto (ver core-jwt.strategy.ts), no algo que TCLogi escriba
  // por su cuenta.
  @Column({ type: 'timestamptz', nullable: true })
  lastSyncedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
