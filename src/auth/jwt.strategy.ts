import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '../common/services/config.service';
import { AuthService } from './services/auth.service';
import { TokenUserInfo } from './dtos/token-user-info.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwt.accessTokenSecret,
    });
  }

  async validate(payload: TokenUserInfo) {
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      subId: payload.subId,
      subIdHash: payload.subIdHash,
      phoneNumber: payload.phoneNumber,
    };
  }
}
