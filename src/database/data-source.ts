import 'dotenv/config';
import { DataSource } from 'typeorm';

// Standalone DataSource used only by the TypeORM CLI (migration:generate/run).
// The Nest app itself uses src/config/typeorm.config.ts via ConfigModule.
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
});
