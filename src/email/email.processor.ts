import {
  Process,
  Processor,
  OnQueueCompleted,
  OnQueueFailed,
  OnQueueProgress,
} from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';

import { EmailService } from './services/email.service';

@Injectable()
@Processor('sendEmail')
export class SendEmailProcessor {
  private readonly logger = new Logger(this.constructor.name);
  constructor(private emailService: EmailService) {}

  @Process()
  async sendEmailConsumer(job: Job) {
    const { email } = job.data;
    this.logger.log(
      `Processor just got a task from 'sendEmail' queue to process with data of email: '${email}`,
    );
    this.logger.log('========= PROCESSOR SEND EMAIL =========');
    try {
      job.progress(10); // Update job progress
      await this.emailService.runSendEmail(email);
      job.progress(100); // Job is complete
    } catch (error) {
      this.logger.error(
        `Error processing job. Job ID: ${job.id}, Error: ${error.message}`,
      );
      throw error;
    }
  }

  @OnQueueCompleted()
  async onCompleted(job: Job, result: any) {
    this.logger.log(
      `Job completed. Job ID: ${job.id}, Result: ${JSON.stringify(result)}`,
    );
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: any) {
    this.logger.error(`Job failed. Job ID: ${job.id}, Error: ${error.message}`);
  }

  @OnQueueProgress()
  async onProgress(job: Job, progress: number) {
    this.logger.log(`Job progress. Job ID: ${job.id}, Progress: ${progress}%`);
  }
}
