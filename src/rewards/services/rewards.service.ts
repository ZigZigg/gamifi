import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { AppConfig, ConditionTurnType, FullCraftReward, RewardMappingType } from 'src/common/constants/constants';
import { EntityManager, In, Not, Repository } from 'typeorm';
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
import { ConfigService } from 'src/common/services/config.service';
import { CommonService } from 'src/common/services/common.service';
import { RewardHistoryService } from 'src/rewardHistory/services/rewardHistory.service';
import { MpointService } from 'src/auth/services/mpoint.service';

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
        private readonly redis: RedisClientService,
        private readonly mmbfService: MmbfService,
        private readonly mpointService: MpointService,
        private readonly eventEmitter: EventEmitter2,
        private readonly configService: ConfigService,
        private readonly rewardHistoryService: RewardHistoryService
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

            const winningReward = this.handleSpinReward(rewards);
            if(!winningReward){
                throw new ApiError(RewardError.REWARD_NOT_FOUND)
            }
            const rewardNaming = CommonService.rewardIntoEnumString(winningReward);

            await this.entityManager.transaction(async (transactionalEntityManager) => {

                // Start session game mmbf and send result

                if(this.configService.thirdPartyApi.enableRegisterMmbf === 'true'){
                    const resultGameSession = await this.mmbfService.registerGameSession({tokenSso, phone: user.phoneNumber, ctkmId, rewardId: winningReward.id});
                    const totalPoint = Number(winningReward.value) || 0;
                    await this.mmbfService.updateGameResult({sessionId: resultGameSession.sessionId, totalPoint, point: rewardNaming.type || 0, ctkmId, rewardId: winningReward.id});
                }

                if(['MP_SCORE', 'VOUCHER_MP'].includes(winningReward.turnType.value)){
                    await this.mpointService.sendRewardMP(user.phoneNumber, winningReward);
                }
                
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

                // Save reward history
                await transactionalEntityManager.save(RewardHistory, {
                    reward: winningReward.id as any,
                    user: user.id as any,
                    receiveDate: new Date().toISOString(), 
                });
            })
            return {...winningReward, name: rewardNaming.text};
        } catch (error) {
            throw error;
        } finally {
            await this.redis.del(rewardKey);
        }

    }

    async craftReward(rewardIds: number[], currentUser: TokenUserInfo){
        if(!rewardIds.length) {
            throw new ApiError(RewardError.REWARDS_EMPTY)
        }
        // Get active campaign
        const campaign = await this.campaignRepository.findOne({
            where: { status: CampaignStatus.ACTIVE },
        });

        if(!campaign) {
            throw new ApiError(RewardError.CAMPAIGN_NOT_FOUND)
        }

        // Get list rewards history
        const rewardHistories: any[] = await this.rewardHistoryService.getRewardHistoryFromUser(currentUser);
        // Check if rewardHistories list include all rewardIds
        const rewardHistoriesById = rewardHistories.filter((rewardHistory) => {
            return rewardIds.includes(rewardHistory.reward.id)
        })
        if(!rewardHistoriesById?.length){
            throw new ApiError(RewardError.REWARD_CRAFT_NOT_MATCH)
        }
        const rewardTypeData = rewardHistoriesById.map(item => {

            return `${item.reward?.turnType?.value || 'UNKNOWN'}`
        }).sort().join('_');
        const matchedReward = FullCraftReward.find(item => item.craftString === rewardTypeData);
        if(!matchedReward){
            throw new ApiError(RewardError.REWARD_CRAFT_NOT_MATCH)
        }

        // Save reward history
        await this.entityManager.transaction(async (transactionalEntityManager) => {

            // Get reward data from Master data by type
            const masterData = await this.masterRepository.findOne({
                where: { value: matchedReward.type },
            });

            // Find reward
            const winningReward = await this.rewardRepository.findOne({
                where: { campaign: { id: campaign.id }, type: TurnType.PAID, turnType: { id: masterData.id } },
                relations: ['turnType']
            })

            if(!winningReward) {
                throw new ApiError(RewardError.MISSING_REWARD_MASTER_DATA)
            }

            // Save reward history
            await transactionalEntityManager.save(RewardHistory, {
                reward: winningReward.id as any,
                user: currentUser.id as any,
                receiveDate: new Date().toISOString(), 
            });
        })

        return matchedReward

    }

    async getRewardStocks(){
        // Get active campaign
        const campaign = await this.campaignRepository.findOne({
            where: { status: CampaignStatus.ACTIVE },
        });

        if(!campaign) {
            throw new ApiError(RewardError.CAMPAIGN_NOT_FOUND)
        }
        const ignoreRewardsType  = ['GOOD_LUCK', 'AIRPOD_DEVICE', 'IPHONE_DEVICE']
        const rewards = await this.rewardRepository.find({
            where: { 
            campaign: { id: campaign.id },
            turnType: { value: Not(In(ignoreRewardsType)) }
            },
            relations: ['turnType']
        });

        const rewardStocks = rewards.map((reward) => {
            return {
                ...reward,
                nameType: CommonService.rewardIntoEnumString(reward).key,
            }
        })
        if(!rewardStocks.length) {
            throw new ApiError(RewardError.REWARDS_EMPTY)
        }
        const groupedRewardStocks = rewardStocks.reduce((acc, reward) => {
            const { nameType, quantity } = reward;
            const currentQuantity = Number(quantity) || 0;
            if (!acc[nameType]) {
                acc[nameType] = { ...reward, quantity: 0 };
            }
            acc[nameType].quantity += currentQuantity;
            return acc;
        }, {});

        const result = Object.values(groupedRewardStocks);
        return result;
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
}