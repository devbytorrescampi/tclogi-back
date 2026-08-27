import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVehicleTypes1787630000000 implements MigrationInterface {
    name = 'AddVehicleTypes1787630000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "vehicle_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" character varying NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_vehicle_types_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_vehicle_types_tenantId_name" ON "vehicle_types" ("tenantId", "name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_vehicle_types_tenantId_name"`);
        await queryRunner.query(`DROP TABLE "vehicle_types"`);
    }

}
