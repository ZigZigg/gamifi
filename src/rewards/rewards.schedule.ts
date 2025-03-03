import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RewardsService } from './services/rewards.service';

@Injectable()
export class RewardsSchedule {
  private readonly logger = new Logger(this.constructor.name);
    constructor(
        private readonly rewardsService: RewardsService,
    ){

    }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async checkCurrentStockToday() {
    this.logger.log('▷▷▷ RUN CHECK AND SAVE CURRENT STOCK TODAY!');
    this.rewardsService.saveCurrentStockToday()
  }

  @Cron(CronExpression.EVERY_HOUR)
  checkHoldStock(){
    this.logger.log('▷▷▷ RUN CHECK HOLD STOCK!');
    this.rewardsService.checkHoldStock()
  }
  @Cron(CronExpression.EVERY_HOUR)
  recalculateGoodLuckRate(){
    this.logger.log('▷▷▷ RUN RECALCULATE GOOD LUCK RATE!');
    this.rewardsService.recalculateGoodLuckRate()
  }

}
