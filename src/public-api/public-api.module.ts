import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PublicApiController } from './public-api.controller';
import { PublicApiService } from './public-api.service';
import { AppConfig } from '../common/constants/constants';
import {
  PublicApi,
  PublicApiLogs,
} from '../database/models/entities';
import { ApiKeyGuard } from './guards/api-key.guard';
import { EmailModule } from '../email/email.module';
import { NoticeModule } from '../notice/notice.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [PublicApi, PublicApiLogs],
      AppConfig.DB,
    ),
    forwardRef(() => EmailModule),
    NoticeModule,
  ],
  providers: [PublicApiService, ApiKeyGuard],
  controllers: [PublicApiController],
  exports: [PublicApiService],
})
export class PublicApiModule {}
