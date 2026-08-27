import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant) private readonly tenantRepo: Repository<Tenant>,
  ) {}

  async findOne(tenantId: string) {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Empresa no encontrada');
    return tenant;
  }

  async completeOnboarding(tenantId: string) {
    const tenant = await this.findOne(tenantId);
    tenant.onboardingCompleted = true;
    return this.tenantRepo.save(tenant);
  }
}
