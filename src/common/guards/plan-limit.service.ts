import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../../modules/subscriptions/subscription.entity';
import { PlanFeatures } from '../../modules/plans/plan.entity';

// Enforces numeric plan limits (maxUsers, maxWarehouses, ...) that TCSoft
// modeled but never checked. Call from a service right before creating the
// limited resource, passing the current count for that tenant.
@Injectable()
export class PlanLimitService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  async assertWithinLimit(
    tenantId: string,
    limitKey: Extract<
      keyof PlanFeatures,
      'maxUsers' | 'maxWarehouses' | 'maxVehicles' | 'maxShipmentsPerMonth'
    >,
    currentCount: number,
  ): Promise<void> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    const limit = subscription?.plan?.features?.[limitKey];
    if (typeof limit === 'number' && currentCount >= limit) {
      throw new ForbiddenException(
        `Alcanzaste el límite de tu plan (${limitKey}: ${limit}). Actualizá tu plan para continuar.`,
      );
    }
  }
}
