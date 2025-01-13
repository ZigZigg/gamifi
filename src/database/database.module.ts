import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { createConnection, Connection } from 'typeorm';
import { AppConfig } from '../common/constants/constants';

import { ConfigService } from '../common/services/config.service';
import { CommonModule } from '../common/common.module';
import { LoggerFactory } from '../common/services/logger.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [CommonModule],
      inject: [ConfigService],
      name: AppConfig.DB,
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.db.host,
        port: configService.db.port,
        username: configService.db.user,
        password: configService.db.pass,
        database: configService.db.name,
        entities: [join(__dirname + '/**/models/*.entity{.ts,.js}')],
        logging: true,
        synchronize: false,
        migrationsRun: true,
        migrations: [
          __dirname + '/**/migrations/*{.ts,.js}',
          __dirname + '/**/seedings/*{.ts,.js}',
        ],
        cli: {
          migrationsDir: 'src/database/migrations',
        },
        extra: {
          max: configService.db.maxConnections,
          idleTimeoutMillis: 31000, // 31s
        },
      }),
    }),
  ],
  providers: [],
  exports: [],
})
export class DatabaseModule {
  private readonly logger = LoggerFactory.create(this.constructor.name);

  public async runMigrations(configService: ConfigService) {
    const connection: Connection = await createConnection({
      type: 'postgres',
      host: configService.db.host,
      port: configService.db.port,
      username: configService.db.user,
      password: configService.db.pass,
      database: configService.db.name
    });
    this.logger.log('Start migration', connection.migrations);
    return connection.runMigrations({ transaction: 'each' });
  }
}
