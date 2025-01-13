import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  UserService,
  AccountService,
  MasterService,
} from './services';
import { UserController } from './user.controller';
import { ConfigService } from '../common/services/config.service';
import {
  User,
  Account,
  Master,
  UserActivity,
  TimeLog,
  UserCampaign,
} from '../database/models/entities';
import { AppConfig } from '../common/constants/constants';
import { JwtStrategy } from '../auth/jwt.strategy';
import { UserSchedule } from './user.schedule';
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature(
      [User, Account, Master, UserActivity, TimeLog, UserCampaign],
      AppConfig.DB,
    ),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.jwt.accessTokenSecret,
        signOptions: { expiresIn: configService.jwt.accessTokenExpireTime },
      }),
    }),
  ],
  providers: [
    UserService,
    AccountService,
    MasterService,
    JwtStrategy,
    UserSchedule,
  ],
  controllers: [UserController],
  exports: [UserService, AccountService, MasterService],
})
export class UserModule {}
