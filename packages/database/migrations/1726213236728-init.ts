import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1726213236728 implements MigrationInterface {
    name = 'Init1726213236728'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "block" ("created_at" TIMESTAMP(6) NOT NULL DEFAULT now(), "number" integer NOT NULL, "timestamp" TIMESTAMP(6), CONSTRAINT "PK_38414873c187a3e0c7943bc4c7b" PRIMARY KEY ("number"))`);
        await queryRunner.query(`CREATE TABLE "contract" ("created_at" TIMESTAMP(6) NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "address" character varying NOT NULL, "network_id" integer NOT NULL, "name" character varying NOT NULL, "is_test_net" boolean NOT NULL DEFAULT true, "is_syncing" boolean NOT NULL DEFAULT false, "is_synced" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_f5b2b2413af31a073b48b13474c" UNIQUE ("address", "network_id"), CONSTRAINT "PK_17c3a89f58a2997276084e706e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "transaction" ("created_at" TIMESTAMP(6) NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "contract_address" character varying NOT NULL, "log_index" integer NOT NULL, "transaction_hash" character varying NOT NULL, "block_number" integer NOT NULL, "event_name" character varying NOT NULL, "from" character varying, "to" character varying, "value" numeric, "contract_id" uuid, CONSTRAINT "UQ_941e7a60b7fe4d59ee3cce40dc6" UNIQUE ("transaction_hash", "log_index"), CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_5a6888faa99bec2c7708d3e7e1a" FOREIGN KEY ("contract_id") REFERENCES "contract"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_2d99bb5a0ab5fb8cf8b746eb399" FOREIGN KEY ("block_number") REFERENCES "block"("number") ON DELETE SET NULL ON UPDATE NO ACTION`);

        // insert BUSD contract
        await queryRunner.query(`INSERT INTO "contract" ("address", "name", "is_test_net", "network_id") VALUES ('0x6a7577c10cd3f595eb2dbb71331d7bf7223e1aac', 'BUSD', true, 11155111)`);        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_2d99bb5a0ab5fb8cf8b746eb399"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_5a6888faa99bec2c7708d3e7e1a"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
        await queryRunner.query(`DROP TABLE "contract"`);
        await queryRunner.query(`DROP TABLE "block"`);
    }

}
