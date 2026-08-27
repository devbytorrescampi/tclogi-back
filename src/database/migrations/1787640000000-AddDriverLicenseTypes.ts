import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDriverLicenseTypes1787640000000 implements MigrationInterface {
    name = 'AddDriverLicenseTypes1787640000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "driver_license_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" character varying NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_driver_license_types_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_driver_license_types_tenantId_name" ON "driver_license_types" ("tenantId", "name")`);
        await queryRunner.query(`ALTER TABLE "drivers" ADD "licenseType" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drivers" DROP COLUMN "licenseType"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_driver_license_types_tenantId_name"`);
        await queryRunner.query(`DROP TABLE "driver_license_types"`);
    }

}
