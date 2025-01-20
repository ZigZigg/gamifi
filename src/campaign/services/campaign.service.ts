import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { AppConfig } from 'src/common/constants/constants';
import { EntityManager, Repository } from 'typeorm';
import { CampaignRequestDto } from '../dtos/request/campaign.request.dto';
import { Campaign, CampaignStatus } from 'src/database/models/campaign.entity';
import { ApiError } from 'src/common/classes/api-error';
import { CampaignError } from '../constants/errors';
import { Rewards, RewardStatus, RewardWinningType, TurnType } from 'src/database/models/rewards.entity';
import { MasterData } from 'src/database/models/master-data.entity';

@Injectable()
export class CampaignService {
    constructor(
        @InjectEntityManager(AppConfig.DB)
        private readonly entityManager: EntityManager,
        @InjectRepository(Campaign, AppConfig.DB)
        private readonly campaignRepository: Repository<Campaign>,
        @InjectRepository(MasterData, AppConfig.DB)
        private readonly masterRepository: Repository<MasterData>,
    ) {}

    async create(body: CampaignRequestDto) {
        // check if campaign which status = active already exist, return error
        const campaign = await this.campaignRepository.findOne({
            where: { status: CampaignStatus.ACTIVE },
        });
        if (campaign && body.status === CampaignStatus.ACTIVE) {
            throw new ApiError(CampaignError.ALREADY_EXISTS_CAMPAIGN)
        }

        const result = await this.entityManager.transaction(async (transactionalEntityManager) => {
            const campaign = await transactionalEntityManager.save(Campaign, body);
            //  Auto create 2 Good luck reward for this campaign
            // Get master data which value = GOOD_LUCK
            const masterDataGoodLuck = await this.masterRepository.findOne({
                where: { value: 'GOOD_LUCK' },
            })
            if(!masterDataGoodLuck) {
                throw new ApiError(CampaignError.DEFAULT_MASTER_DATA_NOT_FOUND)
            }
            const createReward = async (rewardObject: Partial<Rewards>, type: TurnType, turnTypeId?: number) => {
                const rewardData = {
                    ...rewardObject,
                    type,
                };
                if (turnTypeId) {
                    rewardData.turnType = turnTypeId as any;
                }
                await transactionalEntityManager.save(Rewards, rewardData);
            };

            const goodLuckRewardObject = {
                campaign: campaign.id as any,
                turnType: masterDataGoodLuck.id as any,
                value: "0",
                quantity: 1000000,
                initialQuantity: 1000000,
                status: RewardStatus.ACTIVE,
                holdQuantity: 0,
                winningRate: 100,
                initialWinningRate: 100,
                winningType: RewardWinningType.NOLUCK
            };

            const deviceObject = {
                campaign: campaign.id as any,
                value: "0",
                quantity: 1000000,
                initialQuantity: 1000000,
                status: RewardStatus.ACTIVE,
                holdQuantity: 0,
                winningRate: 0,
                initialWinningRate: 0,
                winningType: RewardWinningType.PREMIUM
            };

            await createReward(goodLuckRewardObject, TurnType.FREE);
            await createReward(goodLuckRewardObject, TurnType.PAID);
            await createReward(deviceObject, TurnType.PAID, 11);
            await createReward(deviceObject, TurnType.PAID, 12);
            return campaign;
        })
        return result;
    }
}