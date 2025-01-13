import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Not, In } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import * as firebase from 'firebase-admin';
import * as _ from 'lodash';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

import { AppConfig, ErrorCode } from '../../common/constants/constants';
import { LoggerFactory } from '../../common/services/logger.service';
import {
  Notification,
} from '../../database/models/entities';
import { SendNoticeDto, GetNoticeDto } from '../dto/notice.dto';
import { ApiError } from '../../common/classes/api-error';
import { ConfigService } from '../../common/services/config.service';

@Injectable()
export class NoticeService {
  private twilioClient;
  private readonly logger = LoggerFactory.create(this.constructor.name);

  constructor(
    @InjectEntityManager(AppConfig.DB)
    private readonly entityManager: EntityManager,
    private readonly i18n: I18nService,
    private readonly config: ConfigService,
    @InjectQueue('sendPush') private sendPushQueue: Queue,
    @InjectQueue('sendSMS') private sendSMSQueue: Queue,
  ) {
  }

  public async createNotification(data: SendNoticeDto) {
    const metadata = _.cloneDeep(data.metadata);

    Object.keys(data.metadata).forEach((key) => {
      if (typeof data.metadata[key] !== 'string') {
        data.metadata[key] = JSON.stringify(data.metadata[key]);
      }
    });

    const payload = _.reduce(
      Object.keys(data.metadata),
      (result, item) => {
        if (typeof data.metadata[item] !== 'string') {
          data.metadata[item] = JSON.stringify(data.metadata[item]);
        }

        return data;
      },
      {},
    );

    const hideNo = AppConfig.HIDE_NO;

    if (hideNo.indexOf(data.type) === -1 || metadata.isNotice) {
      const notification = this.entityManager.create(Notification, {
        ...payload,
        adminNoId: metadata.adminNoId ? metadata.adminNoId : null,
      });

      await this.entityManager.save(Notification, notification);

      data.metadata.notificationId = notification.id.toString();
    }

    if (AppConfig.IS_PUSHS.indexOf(data.type) !== -1) {
      await this.sendPushQueue.add({
        notification: data,
      });
    }

    if (AppConfig.IS_SMS.indexOf(data.type) !== -1) {
      await this.sendSMSQueue.add({
        sms: {
          phone: data.metadata.phone,
          content: data.body,
        },
      });
    }

    return true;
  }

  public async getNotifications(userId: number, data: GetNoticeDto) {
    const [notifications, total] = await this.entityManager.findAndCount(
      Notification,
      {
        where: data.unread
          ? { userId, readedAt: null }
          : { userId, readedAt: Not(null) },
        order: { createdAt: 'DESC' },
        skip: data.offset,
        take: data.limit,
      },
    );

    if (total === 0)
      return {
        notifications: [],
        total: 0,
      };

    const results = _.reduce(
      notifications,
      async (result, item) => {
        if (!item.title) {
          item.title = this.i18n.translate('NOTIFICATION.TITLE.' + item.type, {
            ...item.metadata,
          });
        }

        if (!item.body) {
          item.body = this.i18n.translate('NOTIFICATION.BODY.' + item.type, {
            ...item.metadata,
          });
        }

        result.push(item);

        return data;
      },
      [],
    );

    return {
      notifications: results,
      total,
    };
  }

  public async readNotice(userId: number, notificationId: number) {
    const notification = await this.entityManager.findOneBy(Notification, {
      id: notificationId,
      userId,
    });

    if (!notification) {
      ApiError.error(ErrorCode.INVALID_DATA);
    }

    if (!notification.readedAt) {
      notification.readedAt = new Date();
      await this.entityManager.save(notification);
    }

    return true;
  }



  public async unreadCount(userId: number) {
    return await this.entityManager.count(Notification, {
      where: {
        userId,
        readedAt: Not(null),
      },
    });
  }

  public async sendSMS(phone: string, content: string) {
    return await this.sendSMSQueue.add({
      sms: {
        phone,
        content,
      },
    });
  }

  public async runSMS(phone: string, content: string) {
    this.logger.log('SEND TO: ', phone);
    // TODO: removed for security reason
    if (/^\+?91/.test(phone)) {
      return true;
    }

    try {
      await this.twilioClient.messages.create({
        body: content,
        from: 'Wnnr',
        to: phone,
      });

      return true;
    } catch (err) {
      this.logger.error(err);

      return ApiError.error(ErrorCode.SEND_OTP_ERROR);
    }
  }
}
