import { Global, Module } from '@nestjs/common';
import { AdminAuthService } from './services/admin-auth.service';
import {
  AdminAuthController,
  PublicAdminAuthController,
} from './admin-auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '../../common/services/config.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.jwt.accessTokenSecret,
        signOptions: { expiresIn: configService.jwt.accessTokenExpireTime },
      }),
    }),
  ],
  providers: [AdminAuthService],
  controllers: [AdminAuthController, PublicAdminAuthController],
  exports: [AdminAuthService],
})
export class AdminAuthModule {}
