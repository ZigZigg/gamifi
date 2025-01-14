import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterRewardTable1736867121573 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE rewards ALTER COLUMN value TYPE VARCHAR`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE rewards ALTER COLUMN value TYPE BIGINT`);
    }

}
