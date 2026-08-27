import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductBatchAndExpiry1787680000000 implements MigrationInterface {
    name = 'AddProductBatchAndExpiry1787680000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "batchNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "products" ADD "expiresAt" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "batchNumber"`);
    }

}
