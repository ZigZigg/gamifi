import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import { AppConfig } from "src/common/constants/constants";
import { Campaign, CampaignStatus } from "src/database/models/campaign.entity";
import { MasterData } from "src/database/models/master-data.entity";
import { Rewards } from "src/database/models/rewards.entity";
import { EntityManager, Repository } from "typeorm";

@Injectable()
export class RewardsListener {
    private readonly logger = new Logger(this.constructor.name);
    constructor(
        // private readonly entityManager: EntityManager,
        @InjectRepository(MasterData, AppConfig.DB)
        private readonly masterRepository: Repository<MasterData>,
        @InjectRepository(Rewards, AppConfig.DB)
        private readonly rewardRepository: Repository<Rewards>,
          @InjectRepository(Campaign, AppConfig.DB)
          private readonly campaignRepository: Repository<Campaign>,
    ) {}

    @OnEvent('hold-reward.triggered')
    async handleTriggerWorkflow(rewardData: Rewards, campaignId: number) {
      this.logger.log(
        `Triggering workflow for event: Check hold reward`,
      );
      // Get campaign with campaignId and status = ACTIVE
      const campaign = await this.campaignRepository.findOne({
        where: { id: campaignId, status: CampaignStatus.ACTIVE },
      });
      if(!campaign) {
        this.logger.error(`Campaign with id: ${campaignId} is not found or inactive`);
        return;
      }
      const {startDateHold, endDateHold} = campaign
      // Check if current date is in between startDateHold and endDateHold
      const currentDate = new Date().toISOString();
      if(new Date(startDateHold) < new Date(currentDate) && new Date(endDateHold) > new Date(currentDate)){
        return
      }
      const {quantity, holdQuantity, winningRate, id, type, turnType} = rewardData;
    const updatedQuantity = Number(quantity) - 1;
    if (updatedQuantity <= Number(holdQuantity) && parseFloat(winningRate.toString()) > 0 &&  turnType.value !== 'GOOD_LUCK') {
        const updatedWinningReward = {
          winningRate: 0
        };

        await this.rewardRepository.update({ id }, updatedWinningReward);

        const masterDataGoodLuck = await this.masterRepository.findOne({
          where: { value: 'GOOD_LUCK' },
        });

        const goodLuckReward = await this.rewardRepository.findOne({
          where: { campaign: { id: campaignId }, type, turnType: { id: masterDataGoodLuck.id } }
        });
        if (goodLuckReward) {
          const currentGoodLuckRate = parseFloat(goodLuckReward.winningRate.toString()) + parseFloat(winningRate.toString()); ;
          await this.rewardRepository.update({ id: goodLuckReward.id }, { winningRate: currentGoodLuckRate });
        }
        this.logger.log(
            `Triggering workflow for event: Finish hold reward for reward id: ${id} - ${turnType.name}`,
          );
    }

    }
}