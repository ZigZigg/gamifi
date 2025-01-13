import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';

const config = {
        type: 'postgres',
        host: 'localhost',
        port: 3612,
        username: 'gamifi',
        password: 'gamifi2024',
        database: 'gamifi',
        entities: [join(__dirname + '/**/models/*.entity{.ts,.js}')],
        logging: false,
        synchronize: false,
        migrationsRun: true,
        migrations: [
          __dirname + '/**/migrations/*{.ts,.js}',
          __dirname + '/**/seedings/*{.ts,.js}',
        ],
        cli: {
          migrationsDir: 'src/database/migrations',
        },
} as DataSourceOptions

const datasource = new DataSource(config);
datasource.initialize();
export default datasource;

