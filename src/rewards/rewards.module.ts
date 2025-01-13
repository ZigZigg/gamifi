import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from 'src/common/constants/constants';
import { Campaign } from 'src/database/models/campaign.entity';
import { RewardsService } from './services/rewards.service';
import { RewardsController } from './rewards.controller';
import { Rewards } from 'src/database/models/rewards.entity';
import { MasterData } from 'src/database/models/master-data.entity';

// create module
@Module({
    imports: [TypeOrmModule.forFeature([Campaign, Rewards, MasterData], AppConfig.DB)],
    providers: [RewardsService],
    controllers: [RewardsController],
})
export class RewardsModule {}