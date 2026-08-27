import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Shipment } from './shipment.entity';

@Entity('proof_of_deliveries')
export class ProofOfDelivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  shipmentId: string;

  @OneToOne(() => Shipment, (shipment) => shipment.proofOfDelivery, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shipmentId' })
  shipment: Shipment;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ nullable: true })
  signatureUrl: string;

  @Column({ nullable: true })
  receivedByName: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
