import { Controller, Get, Post, Body, Param, UseGuards, Query, UsePipes, ValidationPipe, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RewardHistoryService } from './services/rewardHistory.service';
import { TokenUserInfo } from 'src/auth/dtos';
import { ApiResult } from 'src/common/classes/api-result';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { SearchRewardHistoryRequestDto } from './dtos/request/rewardHistory.request';
import { Response } from 'express';


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

    // Get list of rewards
    @Get('/')
    @ApiOperation({
        summary: 'Get reward history list data by custom field',
      })
    async getList(@Query() params: SearchRewardHistoryRequestDto) {
        const rewards = await this.rewardHistoryService.getList(params)
        return new ApiResult().success(rewards);
    }
    @Post('/export')
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiOperation({
      summary: 'Export reward history',
    })
    async export(
      @Body() params: SearchRewardHistoryRequestDto,
      @Res() res: Response,
    ) {
      const fileBuffer = await this.rewardHistoryService.generateAndExportData(params);
      // Set response headers
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=reward-history-${Date.now()}.xlsx;`,
      );
      res.end(fileBuffer);
    }
}