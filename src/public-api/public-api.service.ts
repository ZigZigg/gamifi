import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Request } from 'express';
import * as moment from 'moment';
import * as _ from 'lodash';

import { SendGiftLinkDTO } from './dtos/requests/send-gift-link.dto';
import {
  EmailType,
  PublicApi,
  PublicApiLogs,
  PublicApiLogsStatus,
} from '../database/models/entities';
import { ConfigService } from '../common/services/config.service';
import { EncryptService } from '../common/services/encrypt.service';
import { AppConfig, HandleLogicBy } from '../common/constants/constants';
import { ErrorCode } from './constants';
import { ApiError } from '../common/classes/api-error';
import { PublicApiStatus } from '../admin/public-api-management/constants';
import { EmailListener } from '../email/email.listener';
import { EmailDataDTO } from '../email/dtos/email.dto';
import { NoticeService } from '../notice/services/notice.service';

@Injectable()
export class PublicApiService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectRepository(PublicApi, AppConfig.DB)
    private readonly publicApiRepository: Repository<PublicApi>,
    @InjectRepository(PublicApiLogs, AppConfig.DB)
    private readonly publicApiLogsRepository: Repository<PublicApiLogs>,
    @InjectEntityManager(AppConfig.DB)
    private readonly entityManager: EntityManager,

    private readonly configService: ConfigService,
    private readonly encryptService: EncryptService,
    private readonly emailService: EmailListener,
    private readonly noticeService: NoticeService,
  ) {}


  private checkConditionSendLinkSuccess(emailResult, smsResult) {
    return (
      emailResult.status === 'fulfilled' ||
      (smsResult && smsResult.status === 'fulfilled')
    );
  }

  private async handleSendGiftLinkSuccess(
    email: string,
    code: string,
    actionId: number,
  ) {
    return this.entityManager.transaction(async (transactionManager) => {
      await transactionManager
        .createQueryBuilder()
        .update(PublicApi)
        .set({ totalUsed: () => 'total_used + 1' })
        .where('code = :code', { code })
        .execute();

      await transactionManager.insert(PublicApiLogs, {
        email,
        code,
        status: PublicApiLogsStatus.PENDING_LOGIN,
        actionId,
      });
    });
  }

  private async verifyReceiveGiftLink(
    payload: SendGiftLinkDTO,
    publicApiCode: string,
    actionId: number,
  ) {
    const publicApi = await this.publicApiRepository.findOneBy({
      code: publicApiCode,
      status: PublicApiStatus.ACTIVE,
    });
    if (!publicApi) {
      throw new ApiError(ErrorCode.PUBLIC_API_NOT_FOUND);
    }

    const receivedGiftLink = await this.publicApiLogsRepository.findOneBy({
      email: payload.email,
      code: publicApi.code,
      actionId,
    });
    if (receivedGiftLink) {
      this.logger.log('User already received gift link');
      return false;
    }

    if (publicApi.totalUsed >= publicApi.limit) {
      this.logger.log('Public API has reached limit');
      return false;
    }
    return publicApi;
  }

  async handleSendEmailFail(code: string, email: string) {
    const publicApiLog = await this.publicApiLogsRepository.findOneBy({
      code,
      email,
    });
    if (!publicApiLog) {
      return;
    }
    await Promise.all([
      this.publicApiRepository
        .createQueryBuilder()
        .update()
        .set({ totalUsed: () => 'total_used - 1' })
        .where('code = :code', { code })
        .execute(),
      this.publicApiLogsRepository.delete({ code, email }),
    ]);
  }
}
