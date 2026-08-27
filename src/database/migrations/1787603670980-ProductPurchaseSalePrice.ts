import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductPurchaseSalePrice1787603670980 implements MigrationInterface {
    name = 'ProductPurchaseSalePrice1787603670980'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "purchasePrice" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "salePrice" numeric(12,2) NOT NULL DEFAULT '0'`);
        // Preserve existing values: the old "costo" field becomes "precio de venta".
        await queryRunner.query(`UPDATE "products" SET "salePrice" = "costPrice"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "costPrice"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "salePrice"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "purchasePrice"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "costPrice" numeric(12,2) NOT NULL DEFAULT '0'`);
    }

}
