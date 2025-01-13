import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { PublicApiService } from './public-api.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { SendGiftLinkDTO } from './dtos/requests/send-gift-link.dto';
import { ApiResult } from '../common/classes/api-result';

@Controller('v1/gift-link')
@ApiTags('Public APIs')
export class PublicApiController {
  constructor(private readonly publicApiService: PublicApiService) {}

}
