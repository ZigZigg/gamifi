import {
  Body,
  Controller,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdminAuthService } from './services/admin-auth.service';
import { ApiResult } from '../../common/classes/api-result';
import { ChangePasswordDTO, LoginDTO } from './dtos';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TokenUserInfo } from '../../auth/dtos';
import { CurrentUser } from '../../auth/decorators/user.decorator';

@Controller('admin/auth')
@ApiTags('Admin Auth')
export class PublicAdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('/login')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'Login by email',
  })
  async login(@Body() data: LoginDTO) {
    const dataResponse = await this.adminAuthService.login(data);

    return new ApiResult().success(dataResponse);
  }
}

@Controller('admin/auth')
@ApiTags('Admin Auth')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Put('/change-password')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'Change user password',
  })
  async changePassword(
    @Body() data: ChangePasswordDTO,
    @CurrentUser() currentUser: TokenUserInfo,
  ) {
    const dataResponse = await this.adminAuthService.changePassword(
      data,
      currentUser.id,
    );

    return new ApiResult().success(dataResponse);
  }
}
