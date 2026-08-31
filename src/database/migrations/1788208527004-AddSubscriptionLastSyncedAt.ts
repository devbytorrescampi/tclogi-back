import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubscriptionLastSyncedAt1788208527004 implements MigrationInterface {
    name = 'AddSubscriptionLastSyncedAt1788208527004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "lastSyncedAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "lastSyncedAt"`);
    }

}
