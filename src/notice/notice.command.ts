import {
  Controller,
  UseGuards,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';

import { MessagePattern, EventPattern } from '@nestjs/microservices';
import { TransformInterceptor } from '../transform.interceptor';
import { CommandDto } from '../common/classes/command.dto';
import { MsExceptionFilter } from '../common/exceptions.filter';
import { MicroserviceGuard } from '../auth/guards/microservice.guard';
import { SendNoticeDto, SendSMSDto } from './dto/notice.dto';
import { NoticeService } from './services/notice.service';

export enum Commands {
  CREATE_NOTIFICATION = 'CREATE_NOTIFICATION',
  DO_SEND_PUSH = 'DO_SEND_PUSH',
  SEND_SMS = 'SEND_SMS',
}

@Controller()
@UseFilters(MsExceptionFilter)
@UseInterceptors(TransformInterceptor)
export class NoticeCommand {
  constructor(private readonly noticeService: NoticeService) {}

  @MessagePattern({ cmd: Commands.CREATE_NOTIFICATION })
  @UseGuards(MicroserviceGuard)
  async createNotification({ data }: CommandDto<SendNoticeDto>) {
    await this.noticeService.createNotification(data);
    return true;
  }

  @MessagePattern({ cmd: Commands.SEND_SMS })
  @UseGuards(MicroserviceGuard)
  async sendSMS({ data }: CommandDto<SendSMSDto>) {
    const { sms } = data;
    return await this.noticeService.runSMS(sms.phone, sms.content);
  }

  @EventPattern(Commands.CREATE_NOTIFICATION)
  @UseGuards(MicroserviceGuard)
  async createNotificationEvent({ data }: CommandDto<SendNoticeDto>) {
    await this.noticeService.createNotification(data);
    return true;
  }

}
