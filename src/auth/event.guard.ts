import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '../common/services/config.service';

@Injectable()
export class EventGuard implements CanActivate {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly config: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const data = context.switchToWs().getData();
    const token = data.token;

    if (!token) {
      return false;
    }

    try {
      jwt.verify(token, this.config.jwt.accessTokenSecret);

      return true;
    } catch (err) {
      this.logger.error(err);

      return false;
    }
  }
}
