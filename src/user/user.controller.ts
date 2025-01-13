import {
  Controller,
  Get,
  UsePipes,
  ValidationPipe,
  Param,
  Query,
  Put,
  Body,
  Delete,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiParam,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

// Other import
import { UserService } from './services/user.service';
import { ApiResult } from '../common/classes/api-result';

// Other import
import { ConfigService } from '../common/services/config.service';
import { CommonService } from '../common/services/common.service';
import {
  SearchUserDTO,
  DeleteUserDTO,
  ChangePasswordDTO,
  UpdateUserDTO,
  SubNewsLetterPayload,
} from './dtos/user.dto';
import { User } from '../database/models/user.entity';
import { ValidateUniqueUserDto } from './dtos/user.dto';
import { TokenUserInfo } from '../auth/dtos/token-user-info.dto';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('users')
@ApiTags('Users')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly commonService: CommonService,
  ) {}


  @Get('/search')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'Get user by custom field',
  })
  async search(@Query() params: SearchUserDTO) {
    const users = await this.userService.searchUser(params);

    return new ApiResult().success(users);
  }

  @Get('/:id')
  @ApiParam({ name: 'id', required: false })
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'Get user by id',
  })
  async getUser(
    @Param('id') id: number,
    @CurrentUser() currentUser: TokenUserInfo,
  ) {
    const user = await this.userService.getUserByField({
      id: id ? id : currentUser.id,
    });

    return new ApiResult().success(user);
  }

  @Get('/:field/:value')
  @ApiParam({ name: 'field', required: false })
  @ApiParam({ name: 'value', required: false })
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'Get user by custom field',
  })
  async getUserByField(
    @Param('field') field: string,
    @Param('value') value: any,
    @CurrentUser() currentUser: TokenUserInfo,
  ) {
    const cond: { [k: string]: any } = { id: currentUser.id };
    if (field && value) {
      cond[field] = value;
    }
    const user = await this.userService.getUserByField(cond);

    return new ApiResult().success(user);
  }

  @Put('/update')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'Update user information',
  })
  async update(
    @Body() user: UpdateUserDTO,
    @CurrentUser() currentUser: TokenUserInfo,
  ) {
    const isUpdateProfile = true;
    const users = await this.userService.updateUser(
      { id: currentUser.id },
      user,
      currentUser.role,
      isUpdateProfile,
    );

    return new ApiResult().success(users);
  }

  @Delete('/delete')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'Delete user',
  })
  async delete(
    @Body() { isHard }: DeleteUserDTO,
    @CurrentUser() currentUser: TokenUserInfo,
  ) {
    const users = await this.userService.deleteUser(
      { id: currentUser.id },
      isHard,
    );

    return new ApiResult().success(users);
  }

  @Post('/change-password')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'Change password',
  })
  async changePassword(
    @Body() { oldPassword, password }: ChangePasswordDTO,
    @CurrentUser() currentUser: TokenUserInfo,
  ) {
    const users = await this.userService.changePassword(
      { id: currentUser.id },
      { password },
      oldPassword,
    );

    return new ApiResult().success(users);
  }

  @Put('/validate-unique')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    status: 200,
    type: Boolean,
    description: 'Validate unique user',
  })
  async validateUnique(
    @CurrentUser() user: TokenUserInfo,
    @Body() userWithValidateUnique: ValidateUniqueUserDto,
  ) {
    const result = await this.userService.validateUnique(
      user.id,
      userWithValidateUnique,
    );
    return new ApiResult().success(!!result);
  }

  @Post('/end-session')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'End Session of user',
  })
  async endSession(@CurrentUser() user: TokenUserInfo) {
    await this.userService.endSession(user.id);

    return new ApiResult().success();
  }
}
