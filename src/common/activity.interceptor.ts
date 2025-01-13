import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as moment from 'moment';
// import {
//   UserRepository,
//   Commands,
// } from '../microservices/repositories/user.repository';
import { RedisClientService } from './services/redis.service';
import { UserActivityType, UserRole } from '../database/models/entities';
import { TokenUserInfo } from '../auth/dtos';
import { UserService } from '../user/services';

@Injectable()
export class ActivityInterceptor implements NestInterceptor {
  constructor(
    // private readonly userRepository: UserRepository,
    private readonly userService: UserService,
    private readonly redis: RedisClientService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user: TokenUserInfo = request.user;
    if (!user) {
      return next.handle();
    }

    if (user.role === UserRole.USER) {
      // this.userRepository.sendEvent(Commands.LOG_AVERAGE_TIME, {
      //   userId: user.id,
      // });
      this.userService.logAverageTime(user.id);
    }

    const key = 'AC_ON_NETWORK_' + user.id;
    const check = await this.redis.get(key);

    if (!check && user.role === UserRole.USER) {
      // this.userRepository.sendEvent(Commands.LOG_ACTIVITY, {
      //   userId: user.id,
      //   type: UserActivityType.ON_NETWORK,
      // });
      this.userService.logActivity(user.id, UserActivityType.ON_NETWORK);
      const time = moment().endOf('day').unix() - moment().unix();
      this.redis.set(key, 'TRUE', time);
    }
    return next.handle();
  }
}
