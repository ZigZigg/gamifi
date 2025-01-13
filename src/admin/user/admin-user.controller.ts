import {
  Controller,
  Body,
  UsePipes,
  ValidationPipe,
  Put,
  UseGuards,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

// Other import

import { Roles, RolesGuard } from '../../auth/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserRole } from '../../database/models/user.entity';
import { ApiResult } from '../../common/classes/api-result';
import { CurrentUser } from '../../auth/decorators/user.decorator';
import { TokenUserInfo } from '../../auth/dtos';
import { AdminUserService } from './services/admin-user.service';
import { AdminUserUpdateUserDTO, SearchAdminUserPageDTO } from './dtos';

@Controller('admin/user')
@ApiTags('Admin User')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get('search')
  @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'Get user information',
  })
  async search(@Query() params: SearchAdminUserPageDTO) {
    const users = await this.adminUserService.searchUser(params);

    return new ApiResult().success(users);
  }

  @Put('update/:userId')
  @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'Admin ban/un-ban user',
  })
  async update(
    @Body() user: AdminUserUpdateUserDTO,
    @Param('userId') userId: number,
    @CurrentUser() currentUser: TokenUserInfo,
  ) {
    const users = await this.adminUserService.adminUpdateUser(
      userId,
      user,
      currentUser,
    );

    return new ApiResult().success(users);
  }
}
