import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameAisleToRack1787595646120 implements MigrationInterface {
    name = 'RenameAisleToRack1787595646120'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "warehouse_locations" ALTER COLUMN "type" TYPE text USING "type"::text`);
        await queryRunner.query(`UPDATE "warehouse_locations" SET "type" = 'RACK' WHERE "type" = 'AISLE'`);
        await queryRunner.query(`DROP TYPE "public"."warehouse_locations_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."warehouse_locations_type_enum" AS ENUM('RACK', 'SHELF', 'BIN')`);
        await queryRunner.query(`ALTER TABLE "warehouse_locations" ALTER COLUMN "type" TYPE "public"."warehouse_locations_type_enum" USING "type"::"public"."warehouse_locations_type_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "warehouse_locations" ALTER COLUMN "type" TYPE text USING "type"::text`);
        await queryRunner.query(`UPDATE "warehouse_locations" SET "type" = 'AISLE' WHERE "type" = 'RACK'`);
        await queryRunner.query(`DROP TYPE "public"."warehouse_locations_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."warehouse_locations_type_enum" AS ENUM('AISLE', 'SHELF', 'BIN')`);
        await queryRunner.query(`ALTER TABLE "warehouse_locations" ALTER COLUMN "type" TYPE "public"."warehouse_locations_type_enum" USING "type"::"public"."warehouse_locations_type_enum"`);
    }

}
