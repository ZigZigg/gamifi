import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { Notification, NotificationType } from '../../database/models/entities';

export class SendNoticeDto {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  type: NotificationType;

  @ApiProperty()
  title: string;

  @ApiProperty()
  body: string;

  @ApiProperty()
  metadata?: any;
}

export class SendSMSDto {
  @IsNotEmpty()
  readonly sms: {
    phone: string;
    content: string;
  };
}

export class PagingRequestDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ required: false, default: 10 })
  limit = 10;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ required: false, default: 0 })
  offset = 0;
}

export class GetNoticeDto extends PagingRequestDto {
  @IsOptional()
  @ApiProperty({ required: false, default: false })
  unread = false;
}

export class NoticeResponseDto {
  @ApiProperty({ type: Notification, isArray: true })
  notifications: Notification[];

  @ApiProperty()
  total: number;
}
