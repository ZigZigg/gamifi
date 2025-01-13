import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { TokenUserInfo } from '../dtos';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TokenUserInfo => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
