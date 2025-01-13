import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiError extends HttpException {
  public data: any;

  constructor(
    message: string,
    httpStatus = HttpStatus.BAD_REQUEST,
    data?: any,
  ) {
    super(message, httpStatus);

    this.data = data;
  }

  static error(message: string, data?: any) {
    throw new ApiError(message, data);
  }
}
