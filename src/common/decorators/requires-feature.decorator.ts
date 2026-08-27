import { SetMetadata } from '@nestjs/common';
import { PlanFeatures } from '../../modules/plans/plan.entity';

export const REQUIRES_FEATURE_KEY = 'requiresFeature';
export const RequiresFeature = (feature: keyof PlanFeatures) =>
  SetMetadata(REQUIRES_FEATURE_KEY, feature);
