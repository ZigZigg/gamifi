import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from 'src/common/constants/constants';
import { Campaign } from 'src/database/models/campaign.entity';
import { RewardsService } from './services/rewards.service';
import { RewardsController } from './rewards.controller';
import { Rewards } from 'src/database/models/rewards.entity';
import { MasterData } from 'src/database/models/master-data.entity';
import { RewardHistory } from 'src/database/models/reward-history.entity';
import { BullModule } from '@nestjs/bull';
import { MmbfService } from 'src/auth/services/mmbf.service';
import { MpointService } from 'src/auth/services/mpoint.service';
import { RewardsListener } from './rewards.listener';
import { RewardHistoryService } from 'src/rewardHistory/services/rewardHistory.service';

// create module
@Module({
    imports: [
        TypeOrmModule.forFeature([Campaign, Rewards, MasterData, RewardHistory], AppConfig.DB)
    ],
    providers: [RewardsService, MmbfService, MpointService, RewardsListener, RewardHistoryService],
    controllers: [RewardsController],
})
export class RewardsModule {}