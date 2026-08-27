import { MigrationInterface, QueryRunner } from "typeorm";

export class MaintenanceTickets1787690000000 implements MigrationInterface {
    name = 'MaintenanceTickets1787690000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" ADD VALUE 'FLEET_SUPERVISOR'`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" ADD VALUE 'MECHANIC'`);

        await queryRunner.query(`CREATE TYPE "public"."maintenance_repair_type_enum" AS ENUM('LOCAL', 'EXTERNAL')`);
        await queryRunner.query(`CREATE TYPE "public"."maintenance_status_enum" AS ENUM('ACTIVE', 'PAUSED', 'FINISHED')`);

        await queryRunner.query(`ALTER TABLE "vehicle_maintenances" ADD "responsibleUserId" uuid`);
        await queryRunner.query(`ALTER TABLE "vehicle_maintenances" ADD "repairType" "public"."maintenance_repair_type_enum"`);
        await queryRunner.query(`ALTER TABLE "vehicle_maintenances" ADD "status" "public"."maintenance_status_enum" NOT NULL DEFAULT 'ACTIVE'`);
        await queryRunner.query(`ALTER TABLE "vehicle_maintenances" ADD CONSTRAINT "FK_vehicle_maintenances_responsibleUserId" FOREIGN KEY ("responsibleUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE "trailer_maintenances" ADD "responsibleUserId" uuid`);
        await queryRunner.query(`ALTER TABLE "trailer_maintenances" ADD "repairType" "public"."maintenance_repair_type_enum"`);
        await queryRunner.query(`ALTER TABLE "trailer_maintenances" ADD "status" "public"."maintenance_status_enum" NOT NULL DEFAULT 'ACTIVE'`);
        await queryRunner.query(`ALTER TABLE "trailer_maintenances" ADD CONSTRAINT "FK_trailer_maintenances_responsibleUserId" FOREIGN KEY ("responsibleUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trailer_maintenances" DROP CONSTRAINT "FK_trailer_maintenances_responsibleUserId"`);
        await queryRunner.query(`ALTER TABLE "trailer_maintenances" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "trailer_maintenances" DROP COLUMN "repairType"`);
        await queryRunner.query(`ALTER TABLE "trailer_maintenances" DROP COLUMN "responsibleUserId"`);

        await queryRunner.query(`ALTER TABLE "vehicle_maintenances" DROP CONSTRAINT "FK_vehicle_maintenances_responsibleUserId"`);
        await queryRunner.query(`ALTER TABLE "vehicle_maintenances" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "vehicle_maintenances" DROP COLUMN "repairType"`);
        await queryRunner.query(`ALTER TABLE "vehicle_maintenances" DROP COLUMN "responsibleUserId"`);

        await queryRunner.query(`DROP TYPE "public"."maintenance_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."maintenance_repair_type_enum"`);

        // Postgres doesn't support removing enum values directly; leaving
        // FLEET_SUPERVISOR/MECHANIC in users_role_enum on rollback.
    }

}
