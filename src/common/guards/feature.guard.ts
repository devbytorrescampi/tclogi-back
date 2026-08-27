import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRES_FEATURE_KEY } from '../decorators/requires-feature.decorator';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
import { PlanFeatures } from '../../modules/plans/plan.entity';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredFeature = this.reflector.getAllAndOverride<
      keyof PlanFeatures
    >(REQUIRES_FEATURE_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredFeature) return true;

    const { user } = context.switchToHttp().getRequest();

    const isActive =
      user?.subscriptionStatus === SubscriptionStatus.ACTIVE ||
      user?.subscriptionStatus === SubscriptionStatus.TRIAL;
    if (!isActive) {
      throw new ForbiddenException('Suscripción inactiva');
    }

    const features: PlanFeatures | undefined = user?.planFeatures;
    if (!features?.[requiredFeature]) {
      throw new ForbiddenException(
        'Tu plan no incluye esta funcionalidad. Actualizá tu plan para acceder.',
      );
    }

    return true;
  }
}
