import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { AppConfig } from 'src/common/constants/constants';
import { EntityManager, Not, Repository } from 'typeorm';
import { Campaign, CampaignStatus } from 'src/database/models/campaign.entity';
import { ApiError } from 'src/common/classes/api-error';
import { Rewards, TurnType } from 'src/database/models/rewards.entity';
import { MasterData } from 'src/database/models/master-data.entity';
import { RewardRequestDto } from '../dtos/request/reward.request.dto';
import { RewardError } from '../constants/errors';

@Injectable()
export class RewardsService {
    constructor(
        @InjectEntityManager(AppConfig.DB)
        private readonly entityManager: EntityManager,
        @InjectRepository(Campaign, AppConfig.DB)
        private readonly campaignRepository: Repository<Campaign>,
        @InjectRepository(Rewards, AppConfig.DB)
        private readonly rewardRepository: Repository<Rewards>,
        @InjectRepository(MasterData, AppConfig.DB)
        private readonly masterRepository: Repository<MasterData>,
    ) {}

    async create(body: RewardRequestDto) {
        const {campaignId, winningRate, type} = body
        // Find campaign by id
        const campaign = await this.campaignRepository.findOne({
            where: { id: campaignId },
        });
        // If campaign not found, return error
        if (!campaign) {
            throw new ApiError(RewardError.CAMPAIGN_NOT_FOUND)
        }
        const validate = await this.validateRating(campaignId, winningRate, type);
        if(!validate) {
            throw new ApiError(RewardError.CREATE_REWARD_FAILED)
        }
        const result = await this.entityManager.transaction(async (transactionalEntityManager) => {
            console.log("🚀 ~ RewardsService ~ result ~ body:", body)
            const rewardObject = {
                ...body,
                campaign: campaignId as any,
                turnType: body.turnTypeId as any,
            }
            const reward = await transactionalEntityManager.save(Rewards, rewardObject);
            return reward;
        })
        return result;
    }

    async validateRating(campaignId: number, rating: number, type: TurnType) {

        const masterDataGoodLuck = await this.masterRepository.findOne({
            where: { value: 'GOOD_LUCK' },
        })
        if(!masterDataGoodLuck) {
            throw new ApiError(RewardError.DEFAULT_MASTER_DATA_NOT_FOUND)
        }
        // Get all rewards of this campaign, except good luck
        const rewards = await this.rewardRepository.find({
            where: { campaign: { id: campaignId }, type, turnType:{id: Not(masterDataGoodLuck.id)} }
        });
        console.log("🚀 ~ RewardsService ~ validateRating ~ rewards:", rewards)
        if(!rewards.length) {
            return true;
        }
        // Sum all rating of rewards
        const totalRating = rewards.reduce((acc, reward) => acc + parseFloat(reward.winningRate.toString()), 0);
        console.log("🚀 ~ RewardsService ~ validateRating ~ totalRating:", totalRating,  totalRating + rating)

        // Check if total rating + new rating > 100, return error
        if(totalRating + rating > 100) {
            throw new ApiError(RewardError.RATING_EXCEED)
        }

        return true;
    }
}