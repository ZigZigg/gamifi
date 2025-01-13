import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
// import { UserRepository } from '../../../microservices/repositories/user.repository';
// import { Type as UserTypeCMD } from '../../../microservices/repositories/user.repository';

import { TokenUserInfo } from '../../../auth/dtos';
import { ApiError } from '../../../common/classes/api-error';
import { checkAdminRolePermission } from '../../../admin/auth/common/common.function';
import { ErrorCode } from '../../../common/constants/errors';
import { AdminUserUpdateUserDTO, SearchAdminUserPageDTO } from '../dtos';
import { UserRole, UserStatus } from '../../../database/models/entities';
import { UserService } from '../../../user/services';
import { ConvertPhoneNumAction } from '../../../common/constants/constants';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class AdminUserService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    // private readonly userRepo: UserRepository,
    private readonly userService: UserService,

    private eventEmitter: EventEmitter2,
  ) {}

  async searchUser(conditions: SearchAdminUserPageDTO) {
    const { filter, search, sortBy, sortDirection, limit, offset } = conditions;

    const usrAlias = 'u';
    const defaultFilter = [
      { key: 'role', value: UserRole.USER, alias: usrAlias },
      {
        key: 'status',
        value: [UserStatus.BANNED, UserStatus.ACTIVE],
        alias: usrAlias,
      },
    ];

    const formatFilter = filter ? [...defaultFilter, ...filter] : defaultFilter;

    // return await this.userRepo.cmdUser(UserTypeCMD.SEARCH, null, {
    //   filter: formatFilter,
    //   search,
    //   ...defaultSort,
    //   limit,
    //   offset,

    // });
    return this.userService.searchUser({
      filter: formatFilter,
      search,
      sortBy,
      sortDirection,
      limit,
      offset,
    });
  }

  async adminUpdateUser(
    userId: number,
    updateData: AdminUserUpdateUserDTO,
    currentUser: TokenUserInfo,
  ) {
    let status = {};
    if (updateData?.status && updateData?.status === UserStatus.ACTIVE) {
      status = { status: UserStatus.BANNED };
    }

    if (updateData?.status && updateData?.status === UserStatus.BANNED) {
      status = { status: UserStatus.ACTIVE };
    }

    // const user = await this.userRepo.cmdUser<User | null>(UserTypeCMD.GET, {
    //   id: userId,
    //   role: UserRole.USER,
    //   ...status,
    // });
    const user = await this.userService.getUserByField({
      id: userId,
      role: UserRole.USER,
      ...status,
    });

    if (!user) throw new ApiError(ErrorCode.USER_NOT_FOUND);
    checkAdminRolePermission(user, currentUser);

    // return await this.userRepo.cmdUser(UserTypeCMD.UPDATE, updateData, {
    //   id: userId,
    // });
    await this.userService.updateUser({ id: userId }, updateData);


    return true;
  }

}
