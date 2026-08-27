import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null; // linked login user, if the driver has app access

  @Column()
  fullName: string;

  @Column({ nullable: true })
  dni: string;

  @Column({ nullable: true })
  licenseType: string; // category, e.g. B1, C1, D1, E1

  @Column({ type: 'date', nullable: true })
  licenseExpiresAt: string | null;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
