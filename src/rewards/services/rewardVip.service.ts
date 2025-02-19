import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { AppConfig, ConditionTurnType, FullCraftReward, REDIS_KEY, RewardMappingType } from 'src/common/constants/constants';
import { EntityManager, In, Not, Repository } from 'typeorm';
import { Campaign, CampaignStatus } from 'src/database/models/campaign.entity';
import { ApiError } from 'src/common/classes/api-error';
import { Rewards, RewardStatus, RewardWinningType, TurnType } from 'src/database/models/rewards.entity';
import { MasterData } from 'src/database/models/master-data.entity';
import { RequestVipRewardDto, RewardRequestDto, RewardUpdateRequestDto, SearchRewardRequestDto, SpinRewardRequestDto } from '../dtos/request/reward.request.dto';
import { RewardError } from '../constants/errors';
import { TokenUserInfo } from 'src/auth/dtos';
import { RewardHistory } from 'src/database/models/reward-history.entity';
import { RedisClientService } from 'src/common/services/redis.service';
import { MmbfService } from 'src/auth/services/mmbf.service';
import { parse } from 'path';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from 'src/common/services/config.service';
import { CommonService } from 'src/common/services/common.service';
import { RewardHistoryService } from 'src/rewardHistory/services/rewardHistory.service';
import { MpointService } from 'src/auth/services/mpoint.service';
import { MasterService } from './master.service';
import { RewardVip, RewardVipStatus } from 'src/database/models/reward-vip.entity';

@Injectable()
export class RewardVipService {
    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectEntityManager(AppConfig.DB)
        private readonly entityManager: EntityManager,
        @InjectRepository(RewardVip, AppConfig.DB)
        private readonly rewardVipRepository: Repository<RewardVip>,
        @InjectRepository(Rewards, AppConfig.DB)
        private readonly rewardRepository: Repository<Rewards>,
        private readonly configService: ConfigService,
        private readonly masterDataService: MasterService,
    ) { }

    async createVip(body: RequestVipRewardDto){
        const {phoneNumber, rewardId} = body
        // Check if phone number already exist
        const existingReward = await this.rewardVipRepository.findOne({ where: { phoneNumber, status: RewardVipStatus.PENDING } });
        if (existingReward) {
            throw new ApiError(RewardError.ALREADY_EXIST_PHONE)
        }

        // Check if reward exist
        const reward = await this.rewardRepository.findOne({ where: { id: rewardId } });
        if (!reward) {
            throw new ApiError(RewardError.REWARD_NOT_FOUND)
        }
        const result = await this.entityManager.transaction(async (transactionalEntityManager) => {
            const rewardVipObject = {
                ...body,
                reward: rewardId as any,
                status: RewardVipStatus.PENDING
            }
            const reward = await transactionalEntityManager.save(RewardVip, rewardVipObject);

            return reward;
        })
        return result;
    }


    async getList() {
        const rewards = await this.rewardVipRepository.find();
        return rewards;
    }
}