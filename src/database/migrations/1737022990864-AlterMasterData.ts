import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterMasterData1737022990864 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Seed data in master_data table with the following data:
        const seedData = [
            { name: 'Airpod', value: 'AIRPOD_DEVICE', type: 'REWARD' },
            { name: 'Iphone', value: 'IPHONE_DEVICE', type: 'REWARD' },
          ];
      
          for (const data of seedData) {
            await queryRunner.query(
                `INSERT INTO master_data (name, value, type) 
                 SELECT $1, $2::varchar, $3
                 WHERE NOT EXISTS (
                   SELECT 1 FROM master_data WHERE value = $2::varchar
                 )`,
                [data.name, data.value, data.type]
              );
          }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
