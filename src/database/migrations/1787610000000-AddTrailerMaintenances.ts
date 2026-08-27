import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTrailerMaintenances1787610000000 implements MigrationInterface {
    name = 'AddTrailerMaintenances1787610000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "trailer_maintenances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" character varying NOT NULL, "trailerId" uuid NOT NULL, "description" character varying NOT NULL, "cost" numeric(10,2), "performedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "nextDueAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_trailer_maintenances_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "trailer_maintenances" ADD CONSTRAINT "FK_trailer_maintenances_trailerId" FOREIGN KEY ("trailerId") REFERENCES "trailers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trailer_maintenances" DROP CONSTRAINT "FK_trailer_maintenances_trailerId"`);
        await queryRunner.query(`DROP TABLE "trailer_maintenances"`);
    }

}
