import { Injectable, Logger } from '@nestjs/common';
import { UserService } from './services';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UserSchedule {
  private readonly logger = new Logger(this.constructor.name);
  constructor(private readonly userService: UserService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async updateSession() {
    this.logger.log('▷▷▷ RUN UPDATE SESSION OF USERS!');
    await this.userService.runUpdateSession();
  }
}
