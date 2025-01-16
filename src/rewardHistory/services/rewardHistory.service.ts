import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenUserInfo } from 'src/auth/dtos';
import { AppConfig } from 'src/common/constants/constants';
import { CommonService } from 'src/common/services/common.service';
import { RewardHistory } from 'src/database/models/reward-history.entity';
import { Repository } from 'typeorm';


@Injectable()
export class RewardHistoryService {
    constructor(
        @InjectRepository(RewardHistory, AppConfig.DB)
        private readonly rewardHistoryRepository: Repository<RewardHistory>,
    ) {}

    async getRewardHistoryFromUser(user: TokenUserInfo){
        // Get reward history from user
        const rewardHistory = await this.rewardHistoryRepository.find({
            where: { user: { id: user.id } },
            relations: ['reward', 'reward.turnType']
        });
        const currentRewardHistory = rewardHistory.map((rewardHistory) => {
            const reward = rewardHistory.reward;
            const rewardType = CommonService.rewardIntoEnumString(reward)
            return {
                ...rewardHistory,
                rewardType
            }
        })
        // Group reward and count rewardHistory inside each group
        const groupedRewardHistory = currentRewardHistory.reduce((acc, curr) => {
            const rewardTypeKey = curr.rewardType;
            if (!acc[rewardTypeKey.key]) {
            acc[rewardTypeKey.key] = { reward: curr.reward, count: 0, name: rewardTypeKey.text };
            }
            acc[rewardTypeKey.key].count += 1;
            return acc;
        }, {});

        // Convert groupedRewardHistory object to an array
        const rewardHistoryArray = Object.values(groupedRewardHistory);
        return rewardHistoryArray;

    }

}