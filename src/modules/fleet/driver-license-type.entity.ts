import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('driver_license_types')
@Index(['tenantId', 'name'], { unique: true })
export class DriverLicenseType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;
}
