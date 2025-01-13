import {
  ExceptionFilter,
  RpcExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { ApiError } from './classes/api-error';
import { ApiResult } from './classes/api-result';
import { ValidationError } from 'class-validator';
import { RpcException } from '@nestjs/microservices';
import { of } from 'rxjs';

const handleException = (
  exception: HttpException | RpcException | Error,
  logger: Logger,
) => {
  const apiResult = new ApiResult<any>();
  apiResult.error(exception.message, exception['status']);
  if (exception instanceof ApiError) {
    apiResult.data = exception.data;
    apiResult.message = exception.message;
    apiResult.errorCode = exception.message;
  } else if (exception instanceof BadRequestException) {
    const errors = exception.message;
    if (
      Array.isArray(errors) &&
      errors.length > 0 &&
      errors[0] instanceof ValidationError
    ) {
      const messages = errors.map((error: ValidationError) => {
        const errorMsg = error.constraints
          ? error.constraints[Object.keys(error.constraints)[0]]
          : error.toString();

        logger.error(` `);
        logger.error(`===== API ERROR =====`);
        logger.error(errorMsg);
        logger.error(`==============`);
        logger.error(` `);
      });

      apiResult.message = messages.join('\n');
    }
  } else if (exception instanceof HttpException) {
    apiResult.message = exception.message;
  } else if (typeof exception.message === 'object') {
    apiResult.message = exception.message;
  }

  return apiResult;
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(this.constructor.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const apiResult = handleException(exception, this.logger);

    this.logger.error(apiResult.message, {
      requestUrl: request.url,
      request: request.body,
      exception,
    });

    if (exception instanceof (UnauthorizedException || ForbiddenException)) {
      return response.status(exception.getStatus()).json({ ...apiResult });
    }

    return response.status(200).json({ ...apiResult });
  }
}

@Catch(Error)
export class MsExceptionFilter implements RpcExceptionFilter<RpcException> {
  private readonly logger = new Logger(this.constructor.name);
  catch(exception: Error, host: ArgumentsHost) {
    const apiResult = handleException(exception, this.logger);
    const ctx = host.switchToRpc();
    const request = ctx.getData();

    this.logger.error(apiResult.message, {
      request,
      exception,
    });
    return of(apiResult);
  }
}
