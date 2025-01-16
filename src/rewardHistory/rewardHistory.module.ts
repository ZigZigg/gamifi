import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardHistoryController } from './rewardHistory.controller';
import { RewardHistory } from 'src/database/models/reward-history.entity';
import { RewardHistoryService } from './services/rewardHistory.service';
import { AppConfig } from 'src/common/constants/constants';

@Module({
    imports: [TypeOrmModule.forFeature([RewardHistory], AppConfig.DB)],
    providers: [RewardHistoryService],
    controllers: [RewardHistoryController],
    exports: [RewardHistoryService],
})
export class RewardHistoryModule {}