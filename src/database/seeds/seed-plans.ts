import { DataSource } from 'typeorm';
import { Plan } from '../../modules/plans/plan.entity';
import { BillingCycle } from '../../common/enums/subscription-status.enum';

export async function seedPlans(dataSource: DataSource) {
  const planRepo = dataSource.getRepository(Plan);

  const plans: Partial<Plan>[] = [
    {
      name: 'Starter',
      description: 'Para operaciones con un solo depósito y flota chica',
      priceUsd: 29.99,
      billingCycle: BillingCycle.MONTHLY,
      trialDays: 14,
      sortOrder: 1,
      features: {
        maxUsers: 5,
        maxWarehouses: 1,
        maxVehicles: 3,
        maxShipmentsPerMonth: 500,
        hasCustomsModule: false,
        hasMultiWarehouseTransfers: false,
        hasRealtimeTracking: true,
        hasReports: false,
      },
    },
    {
      name: 'Growth',
      description: 'Para empresas con múltiples depósitos y flota mediana',
      priceUsd: 79.99,
      billingCycle: BillingCycle.MONTHLY,
      trialDays: 14,
      sortOrder: 2,
      features: {
        maxUsers: 20,
        maxWarehouses: 5,
        maxVehicles: 15,
        maxShipmentsPerMonth: 5000,
        hasCustomsModule: true,
        hasMultiWarehouseTransfers: true,
        hasRealtimeTracking: true,
        hasReports: true,
      },
    },
  ];

  for (const plan of plans) {
    const existing = await planRepo.findOne({ where: { name: plan.name } });
    if (!existing) {
      await planRepo.save(planRepo.create(plan));
    }
  }
}
