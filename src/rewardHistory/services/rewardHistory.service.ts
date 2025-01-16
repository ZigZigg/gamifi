import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenUserInfo } from 'src/auth/dtos';
import { AppConfig } from 'src/common/constants/constants';
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
        // Group reward and count rewardHistory inside each group
        const groupedRewardHistory = rewardHistory.reduce((acc, curr) => {
            const rewardId = curr.reward.id;
            if (!acc[rewardId]) {
            acc[rewardId] = { reward: curr.reward, count: 0 };
            }
            acc[rewardId].count += 1;
            return acc;
        }, {});
        // Convert groupedRewardHistory object to an array
        const rewardHistoryArray = Object.values(groupedRewardHistory);
        return rewardHistoryArray;

    }

}