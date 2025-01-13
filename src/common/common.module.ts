import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { RedisModule } from '@liaoliaots/nestjs-redis';

import { HttpExceptionFilter } from './exceptions.filter';
import { ConfigService } from './services/config.service';
import { CommonService } from './services/common.service';
import { RedisClientService } from './services/redis.service';
import { EncryptService } from './services/encrypt.service';

@Global()
@Module({
  imports: [
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<any> => {
        return {
          config: {
            url: configService.redis.url,
          },
        };
      },
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: ConfigService,
      useValue: new ConfigService(`.env`),
    },
    CommonService,
    RedisClientService,
    EncryptService,
  ],
  exports: [ConfigService, CommonService, RedisClientService, EncryptService],
})
export class CommonModule {}
