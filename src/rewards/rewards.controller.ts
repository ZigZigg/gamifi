import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResult } from 'src/common/classes/api-result';
import { RewardsService } from './services/rewards.service';
import { CraftRewardRequestDto, RequestVipRewardDto, RewardRequestDto, RewardUpdateRequestDto, SearchRewardRequestDto, SpinRewardRequestDto } from './dtos/request/reward.request.dto';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { TokenUserInfo } from 'src/auth/dtos';
import { MasterService } from './services/master.service';
import { RewardVipService } from './services/rewardVip.service';


@Controller('rewards')
@ApiTags('Rewards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RewardsController {
    constructor(
        private readonly rewardsService: RewardsService,
        private readonly rewardVipService: RewardVipService,
        private readonly masterDataService: MasterService
    ) {}

    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    async create(@Body() body: RewardRequestDto) {
        const campaign = await this.rewardsService.create(body);
        return new ApiResult().success(campaign);
    }

    @Put(':id')
    @UsePipes(new ValidationPipe({ transform: true }))
    async update(@Param('id') id: string, @Body() body: RewardUpdateRequestDto) {
        const campaign = await this.rewardsService.update(id, body);
        return new ApiResult().success(campaign);
    }

    // Get list of rewards
    @Get('/')
    @ApiOperation({
        summary: 'Get reward list data by custom field',
      })
    async getList(@Query() params: SearchRewardRequestDto, @CurrentUser() user) {
        const rewards = await this.rewardsService.getList(params, user);
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

    @Get('/getMasterData')
    @UsePipes(new ValidationPipe({ transform: true }))
    async getMasterData() {
        const result = await this.masterDataService.getMasterDataFromCache()
        return new ApiResult().success(result);
    }

    @Delete(':id')
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiOkResponse({
        description: 'Delete reward',
    })
    async deleteReward(@Param('id') id: string) {
        const result = await this.rewardsService.delete(id)
        return new ApiResult().success(result);
    }

    @Post('/addVip')
    @UsePipes(new ValidationPipe({ transform: true }))
    async addVip(@Body() body: RequestVipRewardDto) {
        const campaign = await this.rewardVipService.createVip(body);
        return new ApiResult().success(campaign);
    }
    @Get('/listVip')
    @UsePipes(new ValidationPipe({ transform: true }))
    async listVip() {
        const campaign = await this.rewardVipService.getList();
        return new ApiResult().success(campaign);
    }
}