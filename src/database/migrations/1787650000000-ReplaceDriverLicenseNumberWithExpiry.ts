import { MigrationInterface, QueryRunner } from "typeorm";

export class ReplaceDriverLicenseNumberWithExpiry1787650000000 implements MigrationInterface {
    name = 'ReplaceDriverLicenseNumberWithExpiry1787650000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drivers" DROP COLUMN "licenseNumber"`);
        await queryRunner.query(`ALTER TABLE "drivers" ADD "licenseExpiresAt" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drivers" DROP COLUMN "licenseExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "drivers" ADD "licenseNumber" character varying`);
    }

}
