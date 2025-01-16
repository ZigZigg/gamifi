import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterRewardType1736930277540 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."reward_winning_type" AS ENUM('BASIC', 'MID', 'PREMIUM', 'NOLUCK')`);
        await queryRunner.query(`
            ALTER TABLE rewards
            ADD COLUMN winning_type "public"."reward_winning_type" NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE rewards
            DROP COLUMN winning_type
        `);
        await queryRunner.query(`DROP TYPE "public"."reward_winning_type"`);
    }

}