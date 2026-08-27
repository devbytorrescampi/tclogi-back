import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('trailer_types')
@Index(['tenantId', 'name'], { unique: true })
export class TrailerType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;
}
