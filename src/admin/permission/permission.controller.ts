import {
  Controller,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Get,
  Query,
  Post,
  Put,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

// Other import

import { Roles, RolesGuard } from '../../auth/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserRole } from '../../database/models/user.entity';
import { ApiResult } from '../../common/classes/api-result';
import { PermissionService } from './services/permission.service';
import {
  SearchPermissionRequestDTO,
  UpdatePermissionRequestDTO,
} from './dtos/requests';
import { CurrentUser } from '../../auth/decorators/user.decorator';
import { TokenUserInfo } from '../../auth/dtos';

@Controller('admin/permission-request')
@ApiTags('Admin Permission Request')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PermissionController {
  constructor(private readonly PermissionRequestService: PermissionService) {}

  @Get('search')
  @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'Get permission request information',
  })
  async search(@Query() params: SearchPermissionRequestDTO) {
    const users =
      await this.PermissionRequestService.searchPermissionRequest(params);

    return new ApiResult().success(users);
  }

  @Post('create')
  @Roles([UserRole.ADVERTISER, UserRole.PUBLISHER])
  @ApiOkResponse({
    description: 'User create permission request',
  })
  async create(@CurrentUser() currentUser: TokenUserInfo) {
    const users = await this.PermissionRequestService.createPermissionRequest(
      currentUser.id,
    );

    return new ApiResult().success(users);
  }

  @Put('/update/:permissionReqId')
  @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'Update permission request',
  })
  async update(
    @Body() data: UpdatePermissionRequestDTO,
    @Param('permissionReqId') permissionReqId: number,
    @CurrentUser() currentUser: TokenUserInfo,
  ) {
    const users = await this.PermissionRequestService.updatePermissionRequest(
      permissionReqId,
      data,
      currentUser,
    );

    return new ApiResult().success(users);
  }

  @Get('/status')
  @Roles([UserRole.ADVERTISER, UserRole.PUBLISHER])
  @ApiOkResponse({
    description: 'Check permission request status',
  })
  async checkRequestStatus(@CurrentUser() currentUser: TokenUserInfo) {
    const request = await this.PermissionRequestService.checkRequestStatus(
      currentUser.id,
    );

    return new ApiResult().success(request);
  }
}
