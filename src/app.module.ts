import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import * as path from 'path';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
// import { MicroservicesModule } from './microservices/microservices.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { NoticeModule } from './notice/notice.module';
import { ConfigService } from './common/services/config.service';
import { TransformInterceptor } from './transform.interceptor';
import { AdminModule } from './admin/admin.module';
import { ActivityInterceptor } from './common/activity.interceptor';
import { HealthCheckController } from './app.controller';
import { HealthCheckService } from './app.service';
import { AppConfig } from './common/constants/constants';
import { User } from './database/models/entities';
import { CampaignModule } from './campaign/campaign.module';
import { RewardsModule } from './rewards/rewards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User], AppConfig.DB),
    CommonModule,
    DatabaseModule,
    // MicroservicesModule,
    UserModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    BullModule.forRootAsync({
      imports: [],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.redis.host,
          port: configService.redis.port,
        },
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: config.redis.host,
            port: config.redis.port,
          },
        }),
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    AuthModule,
    EmailModule,
    NoticeModule,
    AdminModule,
    CampaignModule,
    RewardsModule
  ],
  controllers: [HealthCheckController],
  providers: [
    HealthCheckService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityInterceptor,
    },
  ],
})
export class AppModule {}
