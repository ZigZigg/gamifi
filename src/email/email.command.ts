import {
  Controller,
  UseGuards,
  ValidationPipe,
  UsePipes,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';

import { MessagePattern } from '@nestjs/microservices';

import { TransformInterceptor } from '../transform.interceptor';
import { ApiResult } from '../common/classes/api-result';
import { CommandDto } from '../common/classes/command.dto';
import { MsExceptionFilter } from '../common/exceptions.filter';
import { MicroserviceGuard } from '../auth/guards/microservice.guard';

import { EmailService } from './services/email.service';
import { EmailType } from '../database/models/entities';
import { EmailDataDTO } from './dtos/email.dto';

export enum Commands {
  SEND_EMAIL = 'SEND_EMAIL',
}

@Controller()
@UseFilters(MsExceptionFilter)
@UseInterceptors(TransformInterceptor)
export class EmailCommand {
  constructor(private readonly emailServ: EmailService) {}

  @MessagePattern({ cmd: Commands.SEND_EMAIL })
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(MicroserviceGuard)
  async sendEMail(data: CommandDto<EmailDataDTO>): Promise<any> {
    const { payload, type, handleLogicBy } = data.data;
    let response;
    switch (type) {
      case EmailType.WELCOME:
        response = await this.emailServ.sendWelcome(payload);
        break;
      case EmailType.VERIFY:
        response = await this.emailServ.sendVerifyEmail(payload);
        break;
      case EmailType.RESET:
        response = await this.emailServ.sendResetPassword(payload);
        break;
      case EmailType.SET_PASSWORD:
        response = await this.emailServ.sendAdminSetPassword(payload);
        break;
      case EmailType.GET_TICKET_FROM_INVITE_FRIEND:
        response = await this.emailServ.sendGetTicketFromInviteFriend(payload);
        break;
      case EmailType.RECEIVE_GIFT_LINK:
        response = await this.emailServ.sendGiftLink(payload, handleLogicBy);
        break;
      default:
        break;
    }

    return new ApiResult().success(response);
  }
}
