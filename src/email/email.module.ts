import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { BullModule } from '@nestjs/bull';

import { CommonModule } from '../common/common.module';
import { DatabaseModule } from '../database/database.module';

import { EmailService } from './services/email.service';
import { ConfigService } from '../common/services/config.service';
import { EmailCommand } from './email.command';
import { Email } from '../database/models/entities';
import { AppConfig } from '../common/constants/constants';
import { SendEmailProcessor } from './email.processor';
import { EmailListener } from './email.listener';
import { PublicApiModule } from '../public-api/public-api.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Email], AppConfig.DB),
    CommonModule,
    DatabaseModule,
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.mail.host,
          port: configService.mail.port,
          auth: {
            user: configService.mail.user,
            pass: configService.mail.pass,
          },
          secure: true,
          pool: true,
        },
        defaults: {
          from: `"${configService.mail.fromName}" <${configService.mail.fromEmail}>`,
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new PugAdapter(), // or new PugAdapter()
          options: {
            strict: true,
          },
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'sendEmail',
    }),
    forwardRef(() => PublicApiModule),
  ],
  providers: [EmailService, SendEmailProcessor, EmailListener],
  controllers: [EmailCommand],
  exports: [EmailService, EmailListener],
})
export class EmailModule {}
