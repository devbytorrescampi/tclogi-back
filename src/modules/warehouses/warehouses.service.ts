import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { PlanLimitService } from '../../common/guards/plan-limit.service';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    private readonly planLimitService: PlanLimitService,
  ) {}

  async create(tenantId: string, dto: CreateWarehouseDto) {
    const currentCount = await this.warehouseRepo.count({
      where: { tenantId, isActive: true },
    });
    await this.planLimitService.assertWithinLimit(
      tenantId,
      'maxWarehouses',
      currentCount,
    );
    const warehouse = this.warehouseRepo.create({ ...dto, tenantId });
    return this.warehouseRepo.save(warehouse);
  }

  findAll(tenantId: string) {
    return this.warehouseRepo.find({ where: { tenantId }, order: { name: 'ASC' } });
  }

  async findOne(tenantId: string, id: string) {
    const warehouse = await this.warehouseRepo.findOne({ where: { id, tenantId } });
    if (!warehouse) throw new NotFoundException('Depósito no encontrado');
    return warehouse;
  }

  async update(tenantId: string, id: string, dto: Partial<CreateWarehouseDto>) {
    const warehouse = await this.findOne(tenantId, id);
    Object.assign(warehouse, dto);
    return this.warehouseRepo.save(warehouse);
  }

  async remove(tenantId: string, id: string) {
    const warehouse = await this.findOne(tenantId, id);
    warehouse.isActive = false;
    return this.warehouseRepo.save(warehouse);
  }
}
