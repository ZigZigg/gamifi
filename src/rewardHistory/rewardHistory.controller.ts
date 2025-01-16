import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RewardHistoryService } from './services/rewardHistory.service';
import { TokenUserInfo } from 'src/auth/dtos';
import { ApiResult } from 'src/common/classes/api-result';
import { CurrentUser } from 'src/auth/decorators/user.decorator';


@Controller('reward-history')
@ApiTags('Reward History')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RewardHistoryController {
    constructor(private readonly rewardHistoryService: RewardHistoryService) {}

    @Get('/historyByUser')
    async getHistoryByUser(@CurrentUser() currentUser: TokenUserInfo) {
        const rewardHistory = await this.rewardHistoryService.getRewardHistoryFromUser(currentUser);
        return new ApiResult().success(rewardHistory);
    }
}