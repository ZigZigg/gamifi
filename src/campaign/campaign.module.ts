import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './services/campaign.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from 'src/common/constants/constants';
import { Campaign } from 'src/database/models/campaign.entity';
import { MasterData } from 'src/database/models/master-data.entity';

// create module
@Module({
    imports: [TypeOrmModule.forFeature([Campaign, MasterData], AppConfig.DB)],
    providers: [CampaignService],
    controllers: [CampaignController],
})
export class CampaignModule {}