import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { AppConfig } from 'src/common/constants/constants';
import { EntityManager, Repository } from 'typeorm';
import { CampaignRequestDto } from '../dtos/request/campaign.request.dto';
import { Campaign, CampaignStatus } from 'src/database/models/campaign.entity';
import { ApiError } from 'src/common/classes/api-error';
import { CampaignError } from '../constants/errors';
import { Rewards, TurnType } from 'src/database/models/rewards.entity';
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
        if (campaign) {
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
            const goodLuckRewardObject = {
                campaign: campaign.id as any,
                turnType: masterDataGoodLuck.id  as any,
                value: null,
                quantity: 0,
                holdQuantity: 0,
                winningRate: 100,
            }
            await transactionalEntityManager.save(Rewards, {
                ...goodLuckRewardObject,
                type: TurnType.FREE,
            });
            await transactionalEntityManager.save(Rewards, {
                ...goodLuckRewardObject,
                type: TurnType.PAID,
            });
            return campaign;
        })
        return result;
    }
}