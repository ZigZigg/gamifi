import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterRewardUpdateInitRate1736957297212 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE rewards ADD COLUMN initial_winning_rate DECIMAL(12, 8) NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE rewards DROP COLUMN initial_winning_rate`);
    }

}
