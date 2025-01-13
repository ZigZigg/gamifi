import {
  Controller,
  Body,
  Post,
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

import { AdministratorService } from './services/administrator.service';
import { Roles, RolesGuard } from '../../auth/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserRole } from '../../database/models/user.entity';
import { ApiResult } from '../../common/classes/api-result';
import { CurrentUser } from '../../auth/decorators/user.decorator';
import { TokenUserInfo } from '../../auth/dtos';
import { ValidateAdminRolePermissionPipe } from '../auth/pipes/validate-admin-role-permission';
import {
  AdminCreateUserĐTO,
  AdminUpdateUserDTO,
  SearchAdminPageDTO,
  SetPasswordDTO,
} from './dtos/requests';
import {
  CreateUserApiResponseDTO,
  SearchUserAPIResponseDTO,
  UpdateUserAPIResponseDTO,
} from './dtos/responses';

@Controller('admin/administrators')
@ApiTags('Admin Administrator')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdministratorController {
  constructor(private readonly adminService: AdministratorService) {}

  @Get('/campaigns')
  @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'Get user campaigns',
    status: 200,
  })
  async searchCampaign(@Query() params: SearchAdminPageDTO) {
    const campaigns = await this.adminService.searchCampaign(params);
    return new ApiResult().success(campaigns);
  }

  @Get('/')
  @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'Get user information',
    status: 200,
    type: SearchUserAPIResponseDTO,
  })
  async search(@Query() params: SearchAdminPageDTO) {
    const users = await this.adminService.searchUser(params);

    return new ApiResult().success(users);
  }

  @Post('/')
  @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @UsePipes(new ValidationPipe({ transform: true }))
  @UsePipes(new ValidateAdminRolePermissionPipe())
  @ApiOkResponse({
    description: 'Admin create user',
    status: 201,
    type: CreateUserApiResponseDTO,
  })
  async create(
    @Body() user: AdminCreateUserĐTO,
    @CurrentUser() currentUser: TokenUserInfo,
  ) {
    const users = await this.adminService.adminCreateUser(user, currentUser);

    return new ApiResult().success(users);
  }

  @Get('/:id')
  @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'Admin get user detail by id',
    status: 201,
  })
  async getDetail(@Param('id') id: number) {
    const users = await this.adminService.getUserDetail(id);

    return new ApiResult().success(users);
  }

  @Put('/:id')
  @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'Admin Update user information',
    status: 200,
    type: UpdateUserAPIResponseDTO,
  })
  async update(
    @Body() user: AdminUpdateUserDTO,
    @Param('id') id: number,
    @CurrentUser() currentUser: TokenUserInfo,
  ) {
    const users = await this.adminService.adminUpdateUser(
      id,
      user,
      currentUser,
    );

    return new ApiResult().success(users);
  }

  @Put('/:id/password')
  @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'Admin set password information',
    status: 200,
    type: UpdateUserAPIResponseDTO,
  })
  async setPassword(
    @Body() user: SetPasswordDTO,
    @Param('id') id: number,
    @CurrentUser() currentUser: TokenUserInfo,
  ) {
    const users = await this.adminService.adminSetPassword(
      id,
      user,
      currentUser,
    );

    return new ApiResult().success(users);
  }
}
