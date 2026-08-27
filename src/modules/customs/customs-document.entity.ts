import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CustomsDocumentStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  CLEARED = 'CLEARED',
  REJECTED = 'REJECTED',
}

@Entity('customs_documents')
export class CustomsDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  documentType: string; // e.g. import declaration, export declaration, invoice

  @Column({ nullable: true })
  referenceType: string; // 'INBOUND_RECEIPT' | 'SHIPMENT'

  @Column({ nullable: true })
  referenceId: string;

  @Column({ type: 'enum', enum: CustomsDocumentStatus, default: CustomsDocumentStatus.DRAFT })
  status: CustomsDocumentStatus;

  @Column({ nullable: true })
  fileUrl: string;

  @OneToMany('CustomsFee', 'document')
  fees: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('customs_fees')
export class CustomsFee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  documentId: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;
}
