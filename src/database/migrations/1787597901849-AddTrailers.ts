import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTrailers1787597901849 implements MigrationInterface {
    name = 'AddTrailers1787597901849'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."trailers_status_enum" AS ENUM('AVAILABLE', 'ATTACHED', 'MAINTENANCE', 'INACTIVE')`);
        await queryRunner.query(`CREATE TABLE "trailers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" character varying NOT NULL, "licensePlate" character varying NOT NULL, "type" character varying, "capacityKg" numeric(10,2), "capacityM3" numeric(10,3), "status" "public"."trailers_status_enum" NOT NULL DEFAULT 'AVAILABLE', "currentVehicleId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_598af6bec45fafbf70437f32b8b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "model" character varying`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "year" integer`);
        await queryRunner.query(`ALTER TABLE "trailers" ADD CONSTRAINT "FK_3bf94c5e4bb05643fa2a12c1561" FOREIGN KEY ("currentVehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trailers" DROP CONSTRAINT "FK_3bf94c5e4bb05643fa2a12c1561"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "year"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "model"`);
        await queryRunner.query(`DROP TABLE "trailers"`);
        await queryRunner.query(`DROP TYPE "public"."trailers_status_enum"`);
    }

}
