import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { TokenUserInfo } from "src/auth/dtos";
import { AppConfig } from "src/common/constants/constants";
import { Campaign, CampaignStatus } from "src/database/models/campaign.entity";
import { MasterData } from "src/database/models/master-data.entity";
import { RewardHistory } from "src/database/models/reward-history.entity";
import { RewardVip, RewardVipStatus } from "src/database/models/reward-vip.entity";
import { Rewards, RewardStatus } from "src/database/models/rewards.entity";
import { EntityManager, Repository } from "typeorm";

@Injectable()
export class RewardsListener {
    private readonly logger = new Logger(this.constructor.name);
    constructor(
        // private readonly entityManager: EntityManager,
        @InjectEntityManager(AppConfig.DB)
        private readonly entityManager: EntityManager,
        @InjectRepository(MasterData, AppConfig.DB)
        private readonly masterRepository: Repository<MasterData>,
        @InjectRepository(Rewards, AppConfig.DB)
        private readonly rewardRepository: Repository<Rewards>,
        @InjectRepository(RewardVip, AppConfig.DB)
        private readonly rewardVipRepository: Repository<RewardVip>,
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
          winningRate: 0,
          status: RewardStatus.HOLD,
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
    @OnEvent('save-history-reward.triggered')
    async saveHistoryReward(rewardData: Rewards, user: TokenUserInfo, additionalVoucherData: any, redemptionData: any) {
      try {
        await this.entityManager.transaction(async (transactionalEntityManager) => {
            const ratingHistory = redemptionData?.id ? 100 : parseFloat(rewardData.winningRate.toString())
            const noteHistory =  additionalVoucherData 
            ? `${additionalVoucherData?.content?.name || additionalVoucherData?.name} (ID:  ${additionalVoucherData?.id}) - Tỉ lệ ${ratingHistory}% - Gói ${rewardData.type}` 
            : `Tỉ lệ ${ratingHistory}% - Gói ${rewardData.type}`;
            await transactionalEntityManager.save(RewardHistory, {
                reward: rewardData.id as any,
                user: user.id as any,
                receiveDate: new Date().toISOString(),
                note: noteHistory
            });
            if(redemptionData?.id){
              // Update redemption status to REDEEMED
              await transactionalEntityManager.update(RewardVip, { id: redemptionData.id }, { status: RewardVipStatus.REDEEMED });
            }
        })
        this.logger.log(`Save history reward successfully for reward id: ${rewardData.id}`);
      } catch (error) {
        this.logger.error(`Error when save history reward id ${rewardData.id} : ${error.message}`);
      }
    }
  
}