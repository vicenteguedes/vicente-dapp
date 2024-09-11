import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1725971732127 implements MigrationInterface {
  name = "Init1725971732127";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "transaction" ("created_at" TIMESTAMP(6) NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "symbol" character varying NOT NULL, "transaction_hash" character varying NOT NULL, "block_number" integer NOT NULL, "event_name" character varying NOT NULL, "args" jsonb, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "transaction"`);
  }
}
