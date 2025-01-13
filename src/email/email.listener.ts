import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailDataDTO } from './dtos/email.dto';
import { EmailType } from '../database/models/entities';

@Injectable()
export class EmailListener {
  private readonly logger = new Logger(this.constructor.name);
  constructor(private readonly emailService: EmailService) {}

  @OnEvent('email.sent')
  async handleSentEvent(event: EmailDataDTO) {
    const { payload, type, handleLogicBy } = event;
    this.logger.log(`Event sent mail to email: ${payload.email}`);
    let response;
    switch (type) {
      case EmailType.WELCOME:
        response = await this.emailService.sendWelcome(payload);
        break;
      case EmailType.VERIFY:
        response = await this.emailService.sendVerifyEmail(payload);
        break;
      case EmailType.RESET:
        response = await this.emailService.sendResetPassword(payload);
        break;
      case EmailType.SET_PASSWORD:
        response = await this.emailService.sendAdminSetPassword(payload);
        break;
      case EmailType.GET_TICKET_FROM_INVITE_FRIEND:
        response =
          await this.emailService.sendGetTicketFromInviteFriend(payload);
        break;
      case EmailType.RECEIVE_GIFT_LINK:
        response = await this.emailService.sendGiftLink(payload, handleLogicBy);
        break;
      default:
        break;
    }
    return response;
  }
}
