import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductCategoriesAndDropPrices1787670000000 implements MigrationInterface {
    name = 'ProductCategoriesAndDropPrices1787670000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "purchasePrice"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "salePrice"`);
        await queryRunner.query(`CREATE TABLE "product_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" character varying NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_product_categories_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_product_categories_tenantId_name" ON "product_categories" ("tenantId", "name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_product_categories_tenantId_name"`);
        await queryRunner.query(`DROP TABLE "product_categories"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "salePrice" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "purchasePrice" numeric(12,2) NOT NULL DEFAULT '0'`);
    }

}
