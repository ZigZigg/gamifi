import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

import { CommandDto } from '../../common/classes/command.dto';

@Injectable()
export class MicroserviceGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const data = context.switchToRpc().getData<CommandDto<any>>();

    if (data.accessToken) {
      try {
        const info = this.jwtService.verify(data.accessToken, {
          ignoreExpiration: false,
        });

        data.appInfo = info;
      } catch (error) {
        throw new RpcException(error);
      }
    }

    return true;
  }
}
