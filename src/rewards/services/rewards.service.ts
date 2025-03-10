import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { AppConfig, ConditionTurnType, FullCraftReward, REDIS_KEY, RewardMappingType } from 'src/common/constants/constants';
import { EntityManager, In, Not, Repository } from 'typeorm';
import { Campaign, CampaignStatus } from 'src/database/models/campaign.entity';
import { ApiError } from 'src/common/classes/api-error';
import { Rewards, RewardStatus, RewardWinningType, TurnType } from 'src/database/models/rewards.entity';
import { MasterData } from 'src/database/models/master-data.entity';
import { RewardRequestDto, RewardUpdateRequestDto, SearchRewardRequestDto, SpinRewardRequestDto } from '../dtos/request/reward.request.dto';
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
export class RewardsService {
    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectEntityManager(AppConfig.DB)
        private readonly entityManager: EntityManager,
        @InjectRepository(Campaign, AppConfig.DB)
        private readonly campaignRepository: Repository<Campaign>,
        @InjectRepository(Rewards, AppConfig.DB)
        private readonly rewardRepository: Repository<Rewards>,
        @InjectRepository(MasterData, AppConfig.DB)
        private readonly masterRepository: Repository<MasterData>,
        @InjectRepository(RewardHistory, AppConfig.DB)
        private readonly rewardHistoryRepository: Repository<RewardHistory>,
        @InjectRepository(RewardVip, AppConfig.DB)
        private readonly rewardVipRepository: Repository<RewardVip>,
        private readonly redis: RedisClientService,
        private readonly mmbfService: MmbfService,
        private readonly mpointService: MpointService,
        private readonly eventEmitter: EventEmitter2,
        private readonly configService: ConfigService,
        private readonly masterDataService: MasterService,
        private readonly rewardHistoryService: RewardHistoryService
    ) { }

    async getListAllRewards(){
        const rewards = await this.rewardRepository.find({
            relations: ['turnType']
        });
        return rewards;
    }

    async getList(params: SearchRewardRequestDto, user?: TokenUserInfo) {
        const { limit, offset, type } = params
        // get active campaign
        const campaign = await this.campaignRepository.findOne({
            where: { status: CampaignStatus.ACTIVE },
        });
        if (!campaign) {
            throw new ApiError(RewardError.CAMPAIGN_NOT_FOUND)
        }
        let queryBuilder = this.rewardRepository.createQueryBuilder('rw')
            .select('rw.*, CAST(rw."winning_rate" as float),  CAST(rw."initial_winning_rate" as float), CAST(rw."quantity" as int), CAST(rw."initial_quantity" as int)')
            .where('rw."campaignId" = :campaignId', { campaignId: campaign.id })
            .andWhere('rw."type" = :type', { type })

        // Get turn type object
        queryBuilder.leftJoin(
            MasterData,
            'md',
            `md."id" = rw."turnTypeId"`,
        )
            .addSelect(
                ` json_build_object('id', md.id, 'name', md."name", 'value', md.value) as turnType`,
            );
        queryBuilder.orderBy('id', 'ASC').limit(limit).offset(offset);
        const [results, count] = await Promise.all([
            queryBuilder.getRawMany(),
            queryBuilder.getCount(),
        ]);
        return {
            records: results,
            total: count,
        };
    }

    async delete(id: string) {
        const reward = await this.rewardRepository.findOne({
            where: { id: parseInt(id) },
        });
        if (!reward) {
            throw new ApiError(RewardError.REWARD_NOT_FOUND)
        }
        const result = await this.entityManager.transaction(async (transactionalEntityManager) => {
            const deleteResult = await this.rewardRepository.delete({ id: parseInt(id) });
            const masterDataGoodLuck = await this.masterRepository.findOne({
                where: { value: 'GOOD_LUCK' },
            })

            // Get active campaign
            const campaign = await this.campaignRepository.findOne({
                where: { status: CampaignStatus.ACTIVE },
            });
            if (!campaign) {
                throw new ApiError(RewardError.CAMPAIGN_NOT_FOUND)
            }

            const goodLuckReward = await this.rewardRepository.findOne({
                where: { campaign: { id: campaign.id }, type: reward.type, turnType: { id: masterDataGoodLuck.id } }
            })
            if (goodLuckReward) {
                const currentGoodLuckRate = parseFloat(goodLuckReward.winningRate.toString()) + parseFloat(reward.winningRate.toString());
                await transactionalEntityManager.update(Rewards, { id: goodLuckReward.id }, { winningRate: currentGoodLuckRate });
            }
            return deleteResult;

        })

        return result;
    }

    async update(id: string, body: RewardUpdateRequestDto) {
        const { campaign, winningRate, type } = body
        // Check if reward exist
        const reward = await this.rewardRepository.findOne({
            where: { id: parseInt(id) },
        });
        if (!reward) {
            throw new ApiError(RewardError.REWARD_NOT_FOUND)
        }
        // Find campaign by id
        const campaignObject = await this.campaignRepository.findOne({
            where: { id: campaign },
        });
        // If campaign not found, return error
        if (!campaignObject) {
            throw new ApiError(RewardError.CAMPAIGN_NOT_FOUND)
        }
        // const validate = await this.validateRating(campaign, winningRate, type);
        // if(!validate) {
        //     throw new ApiError(RewardError.UPDATE_REWARD_FAILED)
        // }
        const result = await this.entityManager.transaction(async (transactionalEntityManager) => {
            const rewardObject = {
                holdQuantity: body.holdQuantity,
                quantity: body.quantity,
                type: body.type as any,
                value: body.value,
                winningRate: body.winningRate,
                campaign: campaign as any,
                turnType: body.turnTypeId as any,
            }

            const rewardResult = await transactionalEntityManager.update(Rewards, { id: parseInt(id) }, rewardObject);
            const masterDataGoodLuck = await this.masterRepository.findOne({
                where: { value: 'GOOD_LUCK' },
            })

            const goodLuckReward = await this.rewardRepository.findOne({
                where: { campaign: { id: campaign }, type, turnType: { id: masterDataGoodLuck.id } }
            })
            if (goodLuckReward) {
                const formatDiffRate = new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 12,
                }).format(winningRate - parseFloat(reward.winningRate.toString()));
                const currentDiffRate = parseFloat(formatDiffRate);
                const currentGoodLuckRate = parseFloat(goodLuckReward.winningRate.toString()) - currentDiffRate;
                const parseGLRate = isNaN(currentGoodLuckRate) ? currentGoodLuckRate : Number(currentGoodLuckRate.toFixed(5));

                await transactionalEntityManager.update(Rewards, { id: goodLuckReward.id }, { winningRate: parseGLRate });
            }
            return rewardResult;
        })
        return result
    }

    async create(body: RewardRequestDto) {
        const { campaign, winningRate, type } = body
        // Find campaign by id
        const campaignResult = await this.campaignRepository.findOne({
            where: { id: campaign },
        });
        // If campaign not found, return error
        if (!campaignResult) {
            throw new ApiError(RewardError.CAMPAIGN_NOT_FOUND)
        }
        const validate = await this.validateRating(campaign, winningRate, type);
        if (!validate) {
            throw new ApiError(RewardError.CREATE_REWARD_FAILED)
        }
        const result = await this.entityManager.transaction(async (transactionalEntityManager) => {
            const rewardObject = {
                ...body,
                status: RewardStatus.ACTIVE,
                initialWinningRate: winningRate,
                initialQuantity: body.quantity,
                campaign: campaign as any,
                turnType: body.turnTypeId as any,
            }
            const reward = await transactionalEntityManager.save(Rewards, rewardObject);

            const masterDataGoodLuck = await this.masterRepository.findOne({
                where: { value: 'GOOD_LUCK' },
            })

            const goodLuckReward = await this.rewardRepository.findOne({
                where: { campaign: { id: campaign }, type, turnType: { id: masterDataGoodLuck.id } }
            })
            if (goodLuckReward) {
                const currentGoodLuckRate = parseFloat(goodLuckReward.winningRate.toString()) - winningRate;
                await transactionalEntityManager.update(Rewards, { id: goodLuckReward.id }, { winningRate: currentGoodLuckRate, initialWinningRate: currentGoodLuckRate });
            }
            return reward;
        })
        return result;
    }

    async validateRating(campaignId: number, rating: number, type: TurnType) {

        const masterDataGoodLuck = await this.masterRepository.findOne({
            where: { value: 'GOOD_LUCK' },
        })
        if (!masterDataGoodLuck) {
            throw new ApiError(RewardError.DEFAULT_MASTER_DATA_NOT_FOUND)
        }
        // Get all rewards of this campaign, except good luck
        const rewards = await this.rewardRepository.find({
            where: { campaign: { id: campaignId }, type, turnType: { id: Not(masterDataGoodLuck.id) } }
        });
        if (!rewards.length) {
            return true;
        }
        // Sum all rating of rewards
        const totalRating = rewards.reduce((acc, reward) => acc + parseFloat(reward.winningRate.toString()), 0);

        // Check if total rating + new rating > 100, return error
        if (totalRating + rating > 100) {
            throw new ApiError(RewardError.RATING_EXCEED)
        }

        return true;
    }

    async handleProcessSpinReward(data: SpinRewardRequestDto, user: TokenUserInfo) {
        const { spinTypeNumber, tokenSso, ctkmId } = data

        const rewardKey = `lucky-draw:${user.id}:lock`;
        // Check if user still locked
        const isLocked = await this.redis.get(rewardKey);
        if (isLocked) {
            throw new HttpException('User is locked with spinning', HttpStatus.TOO_MANY_REQUESTS);
        }

        await this.redis.set(rewardKey, 'locked', 2);
        this.logger.log(`User ${user.phoneNumber} is spinning with tokenSso ${tokenSso}`);
        try {

            // Get active campaign
            const campaign = await this.campaignRepository.findOne({
                where: { status: CampaignStatus.ACTIVE },
            });

            if (!campaign) {
                throw new ApiError(RewardError.CAMPAIGN_NOT_FOUND)
            }
            // Check user turn type = FREE/PAID
            let turnType = TurnType.FREE;
            if (ConditionTurnType.PAID.includes(spinTypeNumber)) {
                turnType = TurnType.PAID;
            }

            // Get list rewards
            let rewards;
            rewards = await this.rewardRepository.find({
                where: { campaign: { id: campaign.id }, type: turnType },
                relations: ['turnType']
            });

            if (!rewards.length) {
                throw new ApiError(RewardError.REWARDS_EMPTY)
            }

            let winningReward = this.handleSpinReward(rewards);
            let redemptionData = null;
            if (!winningReward) {
                const goodLuckReward = rewards.find(item => item.turnType.value === 'GOOD_LUCK');
                if (goodLuckReward) {
                    winningReward = goodLuckReward;
                }
            }



            const checkIfCraftRewardAlreadyReceived = await this.checkIfCraftRewardAlreadyReceived(winningReward, user);

            if (checkIfCraftRewardAlreadyReceived) {
                this.logger.error('Reward reach limit or reward craft already received')

                const goodLuckReward = rewards.find(item => item.turnType.value === 'GOOD_LUCK');
                if (goodLuckReward) {
                    winningReward = goodLuckReward;
                }
            }

            // Reward vip redemption
            const rewardVipList = await this.rewardVipRepository.find({
                where: { phoneNumber: user.phoneNumber },
                relations: ['reward']
            })

            if(rewardVipList.length){
                // Handle reward reject
                const rewardReject = rewardVipList.find(item => item.status === RewardVipStatus.REJECT && winningReward.id === item.reward.id);
                if(rewardReject){
                    const goodLuckReward = rewards.find(item => item.turnType.value === 'GOOD_LUCK');
                    winningReward = goodLuckReward
                }else{
                    const rewardAll = await this.rewardRepository.find({
                        where: { campaign: { id: campaign.id }},
                        relations: ['turnType']
                    });
                    const rewardVipPending = rewardVipList.filter(item => item.status === RewardVipStatus.PENDING);
                    if(rewardVipPending[0]){
                        const findVipReward = rewardAll.find(item => item.id === rewardVipPending[0].reward?.id)
                        winningReward = findVipReward || winningReward;
                        redemptionData = findVipReward ? {
                            ...rewardVipPending[0]
                        } : null
                    }
                }
            }

            const rewardNaming = CommonService.rewardIntoEnumString(winningReward);
            let additionalVoucherData = null

            await this.entityManager.transaction(async (transactionalEntityManager) => {

                // Start session game mmbf and send result

                if (this.configService.thirdPartyApi.enableRegisterMmbf === 'true') {
                    const resultGameSession = await this.mmbfService.registerGameSession({ tokenSso, phone: user.phoneNumber, ctkmId, rewardId: winningReward.id });
                    const totalPoint = Number(winningReward.value) || 0;
                    await this.mmbfService.updateGameResult({ sessionId: resultGameSession, totalPoint, point: rewardNaming.type || 0, ctkmId, rewardId: winningReward.id });
                }
                if (['MP_SCORE', 'VOUCHER_MP'].includes(winningReward.turnType.value)) {
                    // Log if reward is MP_SCORE or VOUCHER_MP
                    this.logger.log(`User ${user.phoneNumber} win ${rewardNaming.text} (ID: ${winningReward.id})`);
                    const resultVoucher = await this.mpointService.sendRewardMP(user.phoneNumber, winningReward);
                    additionalVoucherData = resultVoucher.voucherData
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
                this.eventEmitter.emit(
                    'save-history-reward.triggered',
                    winningReward,
                    user,
                    additionalVoucherData,
                    redemptionData
                );
            })
            return { ...winningReward, name: rewardNaming.text, additionalVoucherData: additionalVoucherData || null };
        } catch (error) {
            throw error;
        } finally {
            await this.redis.del(rewardKey);
        }

    }

    async craftReward(rewardIds: number[], currentUser: TokenUserInfo) {
        this.logger.log(`CRAFT_REWARD: User ${currentUser.phoneNumber} start craft reward ${rewardIds.join(',')}`);
        if (!rewardIds.length) {
            throw new ApiError(RewardError.REWARDS_EMPTY)
        }
        // Get active campaign
        const campaign = await this.campaignRepository.findOne({
            where: { status: CampaignStatus.ACTIVE },
        });

        if (!campaign) {
            throw new ApiError(RewardError.CAMPAIGN_NOT_FOUND)
        }

        // Get list rewards history
        const rewardHistories: any[] = await this.rewardHistoryService.getRewardHistoryFromUser(currentUser);
        // Check if rewardHistories list include all rewardIds
        const rewardHistoriesById = rewardHistories.filter((rewardHistory) => {
            return rewardIds.includes(rewardHistory.reward.id)
        })
        this.logger.log(`CRAFT_REWARD: User ${currentUser.phoneNumber} - Reward histories ${rewardHistoriesById.map(item => item.reward?.id).join(',')}`);

        if (!rewardHistoriesById?.length) {
            throw new ApiError(RewardError.REWARD_CRAFT_NOT_MATCH)
        }
        const rewardTypeData = rewardHistoriesById.map(item => {

            return `${item.reward?.turnType?.value || 'UNKNOWN'}`
        }).sort().join('_');
        this.logger.log(`CRAFT_REWARD: User ${currentUser.phoneNumber} - Reward type data ${rewardTypeData}`);
        const matchedReward = FullCraftReward.find(item => item.craftString === rewardTypeData);
        if (!matchedReward) {
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

            if (!winningReward) {
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

    async getRewardStocks() {
        // Get active campaign
        const campaign = await this.campaignRepository.findOne({
            where: { status: CampaignStatus.ACTIVE },
        });

        if (!campaign) {
            throw new ApiError(RewardError.CAMPAIGN_NOT_FOUND)
        }
        const ignoreRewardsType = ['GOOD_LUCK']
        const rewards = await this.rewardRepository.find({
            where: {
                campaign: { id: campaign.id },
                turnType: { value: Not(In(ignoreRewardsType)) }
            },
            relations: ['turnType']
        });
        
        const artifactRewards = await this.rewardHistoryRepository.find({
            where: {
                reward:{
                    turnType: {value: In(['IPHONE_DEVICE', 'AIRPOD_DEVICE'])}
                }
            },
            relations: ['reward.turnType']
        });
        const currentArtifactRewards = artifactRewards.map((rewardHistory) => {
            const reward = rewardHistory.reward;
            const rewardType = CommonService.rewardIntoEnumString(reward)
            return {
              ...rewardHistory,
              rewardType
            }
          })
        const groupedRewardHistory = currentArtifactRewards.reduce((acc, curr) => {
            const rewardTypeKey = curr.rewardType;
            if (!acc[rewardTypeKey.key]) {
              acc[rewardTypeKey.key] = { reward: curr.reward, count: 0 };
            }
            acc[rewardTypeKey.key].count += 1;
            return acc;
          }, {});
        const rewardStocks = rewards.map((reward) => {
            return {
                ...reward,
                nameType: CommonService.rewardIntoEnumString(reward).key,
            }
        })
        if (!rewardStocks.length) {
            throw new ApiError(RewardError.REWARDS_EMPTY)
        }
        const groupedRewardStocks = rewardStocks.reduce((acc, reward) => {
            const { nameType, quantity } = reward;
            const currentQuantity = Number(quantity) || 0;
            if (!acc[nameType]) {
                acc[nameType] = { ...reward, quantity: 0 };
            }
            if(['IPHONE_DEVICE','AIRPOD_DEVICE'].includes(nameType)){
                if (acc['IPHONE_DEVICE']) {
                    acc['IPHONE_DEVICE'].quantity = groupedRewardHistory['IPHONE_DEVICE'] ? 1 - groupedRewardHistory['IPHONE_DEVICE'].count : 1;
                }
                if (acc['AIRPOD_DEVICE']) {
                    acc['AIRPOD_DEVICE'].quantity = groupedRewardHistory['AIRPOD_DEVICE'] ? 10 - groupedRewardHistory['AIRPOD_DEVICE'].count : 10;
                }
            }else{
                acc[nameType].quantity += currentQuantity;
            }
            return acc;
        }, {});

        const result = Object.values(groupedRewardStocks);
        return result;
    }

    handleSpinReward(rewards: Rewards[]) {
        if (!rewards || rewards.length === 0) {
            throw new ApiError(RewardError.REWARDS_EMPTY);
        }
        // const testResult = rewards.find(item => item.id === 33);
        // return testResult
        const totalRating = rewards.reduce((sum, reward) => {
            return sum + parseFloat((reward.winningRate || 0).toString())
        } , 0);

        if (totalRating <= 0) {
            throw new ApiError(RewardError.INVALID_TOTAL_RATING);
        }

        const random = Math.random() * totalRating;

        let cumulative = 0;
        for (const reward of rewards) {
            cumulative += parseFloat(reward.winningRate.toString());

            if (random <= cumulative) {
                return reward;
            }
        }
    }

    async checkIfRewardReachLimit(winningReward: Rewards) {
        const rewardStockToday: any = await this.redis.get(REDIS_KEY.REWARD_CURRENT_STOCK_LIST);
        if (!rewardStockToday?.length) {
            return false
        }
        const currentRewardWithStockToday = rewardStockToday.find((item: any) => item.id === winningReward.id);
        if (!currentRewardWithStockToday || currentRewardWithStockToday.quantity < 5) {
            return false
        }
        const { quantity } = currentRewardWithStockToday
        // get 20% of quantity
        const limitQuantity = Math.floor(Number(quantity) * 0.2);
        const remainingQuantity = Number(quantity) - Number(winningReward.quantity);
        if (remainingQuantity >= limitQuantity) {
            return true
        }
        return false
    }

    checkWinningTurnType(totalTurn: number): RewardWinningType | null {
        const currentTurn = totalTurn + 1;
        if (currentTurn === 1) {
            return RewardWinningType.NOLUCK
        }
        if ([3, 6].includes(currentTurn)) {
            return RewardWinningType.BASIC
        }
        if (currentTurn === 15) {
            return RewardWinningType.MID
        }
        return null;
    }

    async saveCurrentStockToday() {
        try {
            // Get list rewards from cached
            const masterData: any = await this.masterDataService.getMasterDataFromCache();
            const goodLuckData = masterData.find(item => item.value === 'GOOD_LUCK');

            // Get Active camapign
            const campaign = await this.campaignRepository.findOne({
                where: { status: CampaignStatus.ACTIVE },
            });
            if (!campaign) {
                this.logger.error('Campaign not found')
                return
            }
            // Get all rewards of this campaign, except good luck
            const rewards = await this.rewardRepository.find({
                where: { campaign: { id: campaign.id }, turnType: { id: Not(goodLuckData.id) } },
                relations: ['turnType']
            });
            const rewardCurrentStock = rewards.map((reward) => {
                return {
                    id: reward.id,
                    quantity: Number(reward.quantity)
                }
            })
            this.redis.set(REDIS_KEY.REWARD_CURRENT_STOCK_LIST, rewardCurrentStock, AppConfig.REDIS_TTL);
        } catch (error) {
            this.logger.error('Error when saveCurrentStockToday', error)
        }

    }

    async checkHoldStock() {
        try {
            // Get current Active campaign
            const campaign = await this.campaignRepository.findOne({
                where: { status: CampaignStatus.ACTIVE },
            });
            if (!campaign) {
                this.logger.error('Campaign not found')
                return
            }
            const { startDateHold, endDateHold } = campaign
            const checkIfValidHoldDate = this.checkValiHolddDate(startDateHold, endDateHold);
            if (!checkIfValidHoldDate) {
                this.logger.error('Invalid hold date')
                return
            }
            await this.rewardRepository.update(
                { campaign: { id: campaign.id } },
                { status: RewardStatus.ACTIVE }
            );
            // Check if start
        } catch (error) {
            this.logger.error('Error when checkHoldStock', error)
        }
    }

    async recalculateGoodLuckRate() {
        try {
            // Get current Active campaign
            const campaign = await this.campaignRepository.findOne({
                where: { status: CampaignStatus.ACTIVE },
            });
            if (!campaign) {
                this.logger.error('Campaign not found')
                return
            }

            await this.entityManager.transaction(async (transactionalEntityManager) => {
                const masterDataGoodLuck = await this.masterRepository.findOne({
                    where: { value: 'GOOD_LUCK' },
                })
                
                // Recaclculate good luck rate for PAID
                const goodLuckRewardPaid = await this.rewardRepository.findOne({
                    where: { campaign: { id: campaign.id }, turnType: { id: masterDataGoodLuck.id }, type: TurnType.PAID }
                })
                if (!goodLuckRewardPaid) {
                    this.logger.error('Good luck reward  PAID not found')
                    return
                }

                const rewards = await this.rewardRepository.find({
                    where: { campaign: { id: campaign.id }, type: TurnType.PAID, turnType: { id: Not(masterDataGoodLuck.id) } }
                });
                const totalRating = rewards.reduce((sum, reward) => {
                    return sum + parseFloat((reward.winningRate || 0).toString())
                } , 0);
                const currentGoodLuckRate = 100 - Number(totalRating.toFixed(5));
                await transactionalEntityManager.update(Rewards, { id: goodLuckRewardPaid.id }, { winningRate: currentGoodLuckRate });

                // Recalculate good luck rate for FREE
                const goodLuckRewardFree = await this.rewardRepository.findOne({
                    where: { campaign: { id: campaign.id }, turnType: { id: masterDataGoodLuck.id }, type: TurnType.FREE }
                })
                if (!goodLuckRewardFree) {
                    this.logger.error('Good luck reward FREE not found')
                    return
                }
                const rewardsFree = await this.rewardRepository.find({
                    where: { campaign: { id: campaign.id }, type: TurnType.FREE, turnType: { id: Not(masterDataGoodLuck.id) } }
                });
                const totalRatingFree = rewardsFree.reduce((sum, reward) => {
                    return sum + parseFloat((reward.winningRate || 0).toString())
                }
                , 0);
                const currentGoodLuckRateFree = 100 - Number(totalRatingFree.toFixed(5));
                await transactionalEntityManager.update(Rewards, { id: goodLuckRewardFree.id }, { winningRate: currentGoodLuckRateFree });
            })
        } catch (error) {
            this.logger.error('Error when recalculateGoodLuckRate', error)
            
        }
    }

    checkValiHolddDate(startDate: Date, endDate: Date) {
        // Check valid date should be: 
        // startDate should less than endDate
        // startDate should less than current date and endDate should greater than current date

        const currentDate = new Date().toISOString();
        if (new Date(startDate) > new Date(endDate)) {
            return false
        }

        if (new Date(startDate) > new Date(currentDate) || new Date(endDate) < new Date(currentDate)) {
            return false
        }
        return true
    }

    async checkIfCraftRewardAlreadyReceived(winningReward: Rewards, currentUser: TokenUserInfo) {
        const rewardHistory = await this.rewardHistoryRepository.find({
            where: { user: { id: currentUser.id } },
            relations: ['reward', 'reward.turnType']
        });
        const artifactRewards = rewardHistory.filter(item => ['IPHONE_DEVICE','AIRPOD_DEVICE'].includes(item.reward.turnType.value) );
        if (artifactRewards.length && ['IP_PIECE_1', 'IP_PIECE_2', 'IP_PIECE_3', 'AIRPOD_PIECE_1', 'AIRPOD_PIECE_2', 'AIRPOD_PIECE_3'].includes(winningReward.turnType.value)) {
            return true
        }
        return false
    }
}