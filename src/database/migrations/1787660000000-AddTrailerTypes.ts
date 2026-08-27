import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTrailerTypes1787660000000 implements MigrationInterface {
    name = 'AddTrailerTypes1787660000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "trailer_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" character varying NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_trailer_types_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_trailer_types_tenantId_name" ON "trailer_types" ("tenantId", "name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_trailer_types_tenantId_name"`);
        await queryRunner.query(`DROP TABLE "trailer_types"`);
    }

}
