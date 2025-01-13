import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { MicroserviceGuard } from './guards/microservice.guard';
import { ConfigService } from '../common/services/config.service';
import { AppConfig } from '../common/constants/constants';
import { EventGuard } from './event.guard';
import { EmailModule } from '../email/email.module';
import { NoticeModule } from '../notice/notice.module';
import { PublicApiLogs } from '../database/models/entities';
import { PublicApiModule } from '../public-api/public-api.module';
import { UserModule } from 'src/user/user.module';
import { AuthService } from './services/auth.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([PublicApiLogs], AppConfig.DB),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.jwt.accessTokenSecret,
        signOptions: { expiresIn: configService.jwt.accessTokenExpireTime },
      }),
    }),
    EmailModule,
    NoticeModule,
    PublicApiModule,
    UserModule
  ],
  providers: [
    AuthService,
    MicroserviceGuard,
    EventGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
