import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardHistoryController } from './rewardHistory.controller';
import { RewardHistory } from 'src/database/models/reward-history.entity';
import { RewardHistoryService } from './services/rewardHistory.service';
import { AppConfig } from 'src/common/constants/constants';
import { User } from 'src/database/models/user.entity';
import { Rewards } from 'src/database/models/rewards.entity';
import { MasterData } from 'src/database/models/master-data.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RewardHistory, User, Rewards, MasterData], AppConfig.DB)],
    providers: [RewardHistoryService],
    controllers: [RewardHistoryController],
    exports: [RewardHistoryService],
})
export class RewardHistoryModule {}