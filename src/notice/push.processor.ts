import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { NoticeService } from './services/notice.service';
import { LoggerFactory } from '../common/services/logger.service';

@Injectable()
@Processor('sendSMS')
export class SendSMSProcessor {
  private readonly logger = LoggerFactory.create(this.constructor.name);

  constructor(private noticeService: NoticeService) {}

  @Process()
  async sendSMSConsumer(job: Job) {
    this.logger.log('========= RUN SEND SMS ON QUEUE =========');
    const { sms } = job.data;

    return await this.noticeService.runSMS(sms.phone, sms.content);
  }
}
