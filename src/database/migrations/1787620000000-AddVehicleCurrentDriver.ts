import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVehicleCurrentDriver1787620000000 implements MigrationInterface {
    name = 'AddVehicleCurrentDriver1787620000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "currentDriverId" uuid`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD CONSTRAINT "FK_vehicles_currentDriverId" FOREIGN KEY ("currentDriverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vehicles" DROP CONSTRAINT "FK_vehicles_currentDriverId"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "currentDriverId"`);
    }

}
