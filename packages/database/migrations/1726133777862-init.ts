import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1726133777862 implements MigrationInterface {
    name = 'Init1726133777862'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "value"`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "value" numeric(36,18)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "value"`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "value" character varying`);
    }

}
