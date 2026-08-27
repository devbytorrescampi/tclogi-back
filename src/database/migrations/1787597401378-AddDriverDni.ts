import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDriverDni1787597401378 implements MigrationInterface {
    name = 'AddDriverDni1787597401378'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drivers" ADD "dni" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drivers" DROP COLUMN "dni"`);
    }

}
