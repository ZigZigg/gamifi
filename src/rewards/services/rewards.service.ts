import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { AppConfig, ConditionTurnType, RewardMappingType } from 'src/common/constants/constants';
import { EntityManager, Not, Repository } from 'typeorm';
import { Campaign, CampaignStatus } from 'src/database/models/campaign.entity';
import { ApiError } from 'src/common/classes/api-error';
import { Rewards, RewardWinningType, TurnType } from 'src/database/models/rewards.entity';
import { MasterData } from 'src/database/models/master-data.entity';
import { RewardRequestDto, SpinRewardRequestDto } from '../dtos/request/reward.request.dto';
import { RewardError } from '../constants/errors';
import { TokenUserInfo } from 'src/auth/dtos';
import { RewardHistory } from 'src/database/models/reward-history.entity';
import { RedisClientService } from 'src/common/services/redis.service';
import { MmbfService } from 'src/auth/services/mmbf.service';
import { parse } from 'path';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RewardsService {
    constructor(
        @InjectEntityManager(AppConfig.DB)
        private readonly entityManager: EntityManager,
        @InjectRepository(Campaign, AppConfig.DB)
        private readonly campaignRepository: Repository<Campaign>,
        @InjectRepository(Rewards, AppConfig.DB)
        private readonly rewardRepository: Repository<Rewards>,
        @InjectRepository(RewardHistory, AppConfig.DB)
        private readonly rewardHistoryRepository: Repository<RewardHistory>,
        @InjectRepository(MasterData, AppConfig.DB)
        private readonly masterRepository: Repository<MasterData>,
        private readonly redis: RedisClientService,
        private readonly mmbfService: MmbfService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async findAll() {
        const rewards = await this.rewardRepository.find();
        return rewards;
    }

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
            const rewardObject = {
                ...body,
                initialWinningRate: winningRate,
                campaign: campaignId as any,
                turnType: body.turnTypeId as any,
            }
            const reward = await transactionalEntityManager.save(Rewards, rewardObject);

            const masterDataGoodLuck = await this.masterRepository.findOne({
                where: { value: 'GOOD_LUCK' },
            })

            const goodLuckReward = await this.rewardRepository.findOne({
                where: { campaign: { id: campaignId }, type, turnType: { id: masterDataGoodLuck.id } }
            })
            if(goodLuckReward) {
                const currentGoodLuckRate = parseFloat(goodLuckReward.winningRate.toString()) - winningRate;
                await transactionalEntityManager.update(Rewards, {id: goodLuckReward.id}, {winningRate: currentGoodLuckRate, initialWinningRate: currentGoodLuckRate});
            }
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
        if(!rewards.length) {
            return true;
        }
        // Sum all rating of rewards
        const totalRating = rewards.reduce((acc, reward) => acc + parseFloat(reward.winningRate.toString()), 0);

        // Check if total rating + new rating > 100, return error
        if(totalRating + rating > 100) {
            throw new ApiError(RewardError.RATING_EXCEED)
        }

        return true;
    }

    async handleProcessSpinReward(data: SpinRewardRequestDto, user: TokenUserInfo){
        const {spinTypeNumber, tokenSso, ctkmId} = data
        const rewardKey = `lucky-draw:${user.id}:lock`;
        // Check if user still locked
        const isLocked = await this.redis.get(rewardKey);
        if (isLocked) {
          throw new HttpException('User is locked with spinning', HttpStatus.TOO_MANY_REQUESTS);
        }

        await this.redis.set(rewardKey, 'locked', 2);
        try {
            
            // Get active campaign
            const campaign = await this.campaignRepository.findOne({
                where: { status: CampaignStatus.ACTIVE },
            });

            if(!campaign) {
                throw new ApiError(RewardError.CAMPAIGN_NOT_FOUND)
            }
            // Check user turn type = FREE/PAID
            let turnType = TurnType.FREE;
            if(ConditionTurnType.PAID.includes(spinTypeNumber)) {
                turnType = TurnType.PAID;
            }

            // Get list rewards
            let rewards;
            rewards = await this.rewardRepository.find({
                where: { campaign: { id: campaign.id }, type: turnType },
                relations: ['turnType']
                });

            if(!rewards.length) {
                throw new ApiError(RewardError.REWARDS_EMPTY)
            }

            const winningReward = this.handleSpinReward(rewards.slice(0,1));
            if(!winningReward){
                throw new ApiError(RewardError.REWARD_NOT_FOUND)
            }
            await this.entityManager.transaction(async (transactionalEntityManager) => {
                const updatedRewardResult = await transactionalEntityManager.createQueryBuilder()
                .update(Rewards)
                .set({ quantity: () => 'quantity - 1' })
                .where('id = :id AND quantity > 0', { id: winningReward.id })
                .execute();
                if (updatedRewardResult.affected === 0) {
                    throw new ApiError(RewardError.REWARD_OUT_OF_STOCK)
                }
                
                // Check hold quantity
                this.eventEmitter.emit(
                    'hold-reward.triggered',
                    winningReward,
                    campaign.id
                );

                // Start session game mmbf and send result

                // const resultGameSession = await this.mmbfService.registerGameSession({tokenSso, phone: user.phoneNumber, ctkmId});
                // console.log("🚀 ~ RewardsService ~ awaitthis.entityManager.transaction ~ resultGameSession:", resultGameSession)

                // Save reward history
                await transactionalEntityManager.save(RewardHistory, {
                    reward: winningReward.id as any,
                    user: user.id as any,
                    receiveDate: new Date().toISOString(), 
                });
            })
            const rewardNaming = this.rewardIntoEnumString(winningReward)
            return {...winningReward, name: rewardNaming.text};
        } catch (error) {
            throw error;
        } finally {
            await this.redis.del(rewardKey);
        }

    }

    handleSpinReward(rewards: Rewards[]){
        if (!rewards || rewards.length === 0) {
            throw new ApiError(RewardError.REWARDS_EMPTY);
        }

        const totalRating = rewards.reduce((sum, reward) => sum + parseFloat(reward.winningRate.toString()) , 0);

        if (totalRating <= 0) {
            throw new ApiError(RewardError.INVALID_TOTAL_RATING);
        }

        const random = Math.random() * totalRating;

        let cumulative = 0;
        for (const reward of rewards) {
            cumulative +=  parseFloat(reward.winningRate.toString());

            if (random <= cumulative) {
            return reward;
            }
        }
        throw new ApiError(RewardError.REWARD_NOT_FOUND);
    }

    checkWinningTurnType(totalTurn: number): RewardWinningType | null{
        const currentTurn = totalTurn + 1;
        if(currentTurn === 1){
            return RewardWinningType.NOLUCK
        }
        if([3 ,6].includes(currentTurn)){
            return RewardWinningType.BASIC
        }
        if(currentTurn === 15){
            return RewardWinningType.MID
        }
        return null;
    }

    rewardIntoEnumString(reward: Rewards){
        const {value, turnType} = reward
        const {value: turnTypeValue, name} = turnType
        let enumString = `${turnTypeValue}`
        if(value){
            enumString = `${turnTypeValue}_${value}`
        }
        const findObject = RewardMappingType.find(item => item.key === enumString)
        if(findObject){
            return findObject
        }
        return {
            key: enumString,
            text: `${name}`
        }
    }
}