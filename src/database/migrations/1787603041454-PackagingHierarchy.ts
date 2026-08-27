import { MigrationInterface, QueryRunner } from "typeorm";

export class PackagingHierarchy1787603041454 implements MigrationInterface {
    name = 'PackagingHierarchy1787603041454'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Pre-existing rows used the old flat "unit" schema and can't map
        // cleanly onto the new fixed hierarchy — clear them out first.
        await queryRunner.query(`DELETE FROM "product_packagings"`);
        await queryRunner.query(`ALTER TABLE "product_packagings" DROP COLUMN "unit"`);
        await queryRunner.query(`ALTER TABLE "product_packagings" ADD "level" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_packagings" ADD "containsQuantity" integer NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_04b0a647fd22a399de5a536dbb" ON "product_packagings"  ("productId", "level") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_04b0a647fd22a399de5a536dbb"`);
        await queryRunner.query(`ALTER TABLE "product_packagings" DROP COLUMN "containsQuantity"`);
        await queryRunner.query(`ALTER TABLE "product_packagings" DROP COLUMN "level"`);
        await queryRunner.query(`ALTER TABLE "product_packagings" ADD "unit" character varying NOT NULL`);
    }

}
