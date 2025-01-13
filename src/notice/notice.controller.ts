import {
  Controller,
  UseGuards,
  Get,
  ValidationPipe,
  UsePipes,
  Query,
  Request,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiResult } from '../common/classes/api-result';
import { GetNoticeDto, NoticeResponseDto } from './dto/notice.dto';
import { NoticeService } from './services/notice.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@ApiTags('Notifications')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get('')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({ type: NoticeResponseDto })
  async getNotifications(
    @Query() data: GetNoticeDto,
    @Request() req,
  ): Promise<NoticeResponseDto> {
    return this.noticeService.getNotifications(req.user.id, data);
  }

  @Put(':id/read')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({ type: ApiResult })
  async readNotification(@Param('id') id: number, @Request() req) {
    await this.noticeService.readNotice(req.user.id, id);
    return new ApiResult().success(true);
  }

  @Get('/unread')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({ type: ApiResult })
  async unreadCount(@Request() req) {
    const count = await this.noticeService.unreadCount(req.user.id);
    return new ApiResult().success(count);
  }
}
