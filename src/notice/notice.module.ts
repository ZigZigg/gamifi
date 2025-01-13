import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NoticeService } from './services/notice.service';
import { NoticeCommand } from './notice.command';
import { NoticeController } from './notice.controller';
import { CommonModule } from '../common/common.module';
import { DatabaseModule } from '../database/database.module';
import { BullModule } from '@nestjs/bull';

import { AppConfig } from '../common/constants/constants';
import { Notification } from '../database/models/entities';
import { SendSMSProcessor } from './push.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification], AppConfig.DB),
    CommonModule,
    DatabaseModule,
    BullModule.registerQueue({
      name: 'sendPush',
    }),
    BullModule.registerQueue({
      name: 'sendSMS',
    }),
  ],
  providers: [NoticeService, SendSMSProcessor],
  controllers: [NoticeCommand, NoticeController],
  exports: [NoticeService],
})
export class NoticeModule {}
