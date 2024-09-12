import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1726127131133 implements MigrationInterface {
    name = 'Init1726127131133'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transaction" ("created_at" TIMESTAMP(6) NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "address" character varying NOT NULL, "log_index" integer NOT NULL, "transaction_hash" character varying NOT NULL, "block_number" integer NOT NULL, "event_name" character varying NOT NULL, "from" character varying, "to" character varying, "value" numeric(36,18), CONSTRAINT "UQ_941e7a60b7fe4d59ee3cce40dc6" UNIQUE ("transaction_hash", "log_index"), CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "transaction"`);
    }

}
