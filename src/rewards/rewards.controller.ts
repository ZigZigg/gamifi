import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiResult } from 'src/common/classes/api-result';
import { RewardsService } from './services/rewards.service';
import { RewardRequestDto } from './dtos/request/reward.request.dto';


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
}