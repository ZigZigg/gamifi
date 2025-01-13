import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppConfig, HandleLogicBy } from '../../common/constants/constants';
import { MailerService } from '@nestjs-modules/mailer';
import * as escapeHTML from 'escape-html';
import { ConfigService } from '../../common/services/config.service';
import { LoggerFactory } from '../../common/services/logger.service';
import { Email, EmailStatus, EmailType } from '../../database/models/entities';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

export class EmailData {
  email: string;
  code?: string;
  token?: string;
  name?: string;
  pass?: string;
  giftLink?: string;
  actionName?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = LoggerFactory.create(this.constructor.name);
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    @InjectRepository(Email, AppConfig.DB)
    private readonly emailRepository: Repository<Email>,
    @InjectQueue('sendEmail') private sendEmailQueue: Queue,
  ) {}

  async sendEmail(
    to: string,
    code: EmailType,
    payload?: Map<string, string>,
    handleBy: HandleLogicBy = HandleLogicBy.DIRECT,
  ) {

    return true;
  }

  async sendVerifyEmail(data: EmailData) {
    const payload = new Map();
    payload.set('name', data.name ? data.name : 'there');
    payload.set('code', data.code);
    payload.set(
      'link',
      this.configService.basePath + '/verify-email?token=' + data.token,
    );
    this.sendEmail(data.email, EmailType.VERIFY, payload);
  }

  async sendResetPassword(data: EmailData) {
    const payload = new Map();
    payload.set('name', data.name ? data.name : 'there');
    payload.set('code', data.code);
    payload.set(
      'link',
      this.configService.fePath + '/reset-password?token=' + data.token,
    );
    this.sendEmail(data.email, EmailType.RESET, payload);
  }

  async sendWelcome(data: EmailData) {
    const payload = new Map();
    payload.set('name', data.name ? data.name : 'there');
    payload.set('pass', data.pass ? data.pass : '');
    payload.set('email', data.email);
    this.sendEmail(
      data.email,
      data.pass ? EmailType.WELCOME_WITH_LOGIN : EmailType.WELCOME,
      payload,
    );
  }

  async sendAdminSetPassword(data: EmailData) {
    const payload = new Map();
    payload.set('name', data.name ? data.name : 'there');
    payload.set('pass', data.pass ? data.pass : '');
    this.sendEmail(data.email, EmailType.SET_PASSWORD, payload);
  }

  async sendGetTicketFromInviteFriend(data: EmailData) {
    this.sendEmail(data.email, EmailType.GET_TICKET_FROM_INVITE_FRIEND, null);
  }

  async sendGiftLink(data: EmailData, handleLogicBy: HandleLogicBy) {
    const payload = new Map();
    payload.set('link', data.giftLink ? data.giftLink : '');
    payload.set('code', data.code ? data.code : '');
    await this.sendEmail(
      data.email,
      EmailType.RECEIVE_GIFT_LINK,
      payload,
      handleLogicBy,
    );
  }

  async runSendEmail(email: Email) {
    this.logger.log('======== SEND EMAIL: ', email.to, email.title);

    const sent = await this.mailerService.sendMail({
      to: email.to,
      subject: email.title,
      html: email.content,
    });

    this.logger.log('SENT: ', sent.messageId);

    await this.emailRepository.update(
      {
        id: email.id,
      },
      {
        status: EmailStatus.DONE,
      },
    );
  }
}
