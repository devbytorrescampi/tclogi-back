import dataSource from '../data-source';
import { seedPlans } from './seed-plans';

async function run() {
  await dataSource.initialize();
  await seedPlans(dataSource);
  await dataSource.destroy();
  // eslint-disable-next-line no-console
  console.log('Plans seeded');
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
