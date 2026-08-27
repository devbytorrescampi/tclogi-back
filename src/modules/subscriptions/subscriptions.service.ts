import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './subscription.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  findCurrentByTenant(tenantId: string) {
    return this.subscriptionRepo.findOne({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  // TODO: PayPal / MercadoPago checkout + webhook handling, mirroring the
  // TCSoft pattern (see conversation notes) — createPaypalSubscription,
  // capturePaypalSubscription, setupMpPlans, handleMpSubscriptionWebhook,
  // plus daily crons expireTrials() / expireCancelledSubscriptions().
}
