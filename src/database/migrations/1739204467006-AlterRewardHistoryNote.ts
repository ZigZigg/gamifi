import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoGenerated1739204467006 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE reward_history ADD COLUMN note VARCHAR`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
