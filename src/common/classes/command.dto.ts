import { ApiProperty } from '@nestjs/swagger';

export class CommandDto<T> {
  @ApiProperty()
  accessToken: string;
  appInfo?: { appType: string };

  @ApiProperty()
  data: T;

  constructor(accessToken: string, data: T) {
    this.accessToken = accessToken;
    this.data = data;
  }
}
