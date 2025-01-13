import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CampaignService } from './services/campaign.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CampaignRequestDto } from './dtos/request/campaign.request.dto';
import { ApiResult } from 'src/common/classes/api-result';


@Controller('campaign')
@ApiTags('Campaign')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CampaignController {
    constructor(private readonly campaignService: CampaignService) {}

    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))

    async create(@Body() body: CampaignRequestDto) {
        const campaign = await this.campaignService.create(body);
        return new ApiResult().success(campaign);
    }
}