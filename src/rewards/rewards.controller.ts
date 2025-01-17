import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiResult } from 'src/common/classes/api-result';
import { RewardsService } from './services/rewards.service';
import { CraftRewardRequestDto, RewardRequestDto, SpinRewardRequestDto } from './dtos/request/reward.request.dto';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { TokenUserInfo } from 'src/auth/dtos';


@Controller('rewards')
@ApiTags('Rewards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RewardsController {
    constructor(private readonly rewardsService: RewardsService) {}

    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    async create(@Body() body: RewardRequestDto) {
        const campaign = await this.rewardsService.create(body);
        return new ApiResult().success(campaign);
    }

    // Get list of rewards
    @Get()
    async findAll() {
        const rewards = await this.rewardsService.findAll();
        return new ApiResult().success(rewards);
    }

    @Post('/spinReward')
    @UsePipes(new ValidationPipe({ transform: true }))
    async spinReward(@Body() body: SpinRewardRequestDto, @CurrentUser() currentUser: TokenUserInfo) {
        const result = await this.rewardsService.handleProcessSpinReward(body, currentUser);
        return new ApiResult().success(result);
    }

    @Post('/craftRewards')
    @UsePipes(new ValidationPipe({ transform: true }))
    async craftRewards(@Body() body: CraftRewardRequestDto, @CurrentUser() currentUser: TokenUserInfo) {
        const {rewardIds} = body
        const result = await this.rewardsService.craftReward(rewardIds, currentUser);
        return new ApiResult().success(result);
    }

    @Get('/getRewardsStock')
    @UsePipes(new ValidationPipe({ transform: true }))
    async getRewardsStock() {
        const result = await this.rewardsService.getRewardStocks()
        return new ApiResult().success(result);
    }
}