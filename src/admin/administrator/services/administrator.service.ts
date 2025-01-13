import { Injectable, Logger } from '@nestjs/common';
// import { UserRepository } from '../../../microservices/repositories/user.repository';
// import {
//   Type as UserTypeCMD,
//   Commands as UserCommands,
// } from '../../../microservices/repositories/user.repository';
import { ApiError } from '../../../common/classes/api-error';
import { ErrorCode } from '../../../common/constants/errors';
import { TokenUserInfo } from '../../../auth/dtos';
import { checkAdminRolePermission } from '../../auth/common/common.function';
import {
  User,
  UserRole,
  UserStatus,
} from '../../../database/models/entities';
import { SearchUserResponseDTO } from '../dtos/responses';
// import { EmailRepository } from '../../../microservices/repositories/email.repository';
import { CommonService } from '../../../common/services/common.service';
import {
  AdminCreateUserĐTO,
  AdminUpdateUserDTO,
  SearchUserCampaignPageDTO,
  SetPasswordDTO,
} from '../dtos/requests';
import { UserService } from '../../../user/services';
import { SearchUserDTO } from '../../../user/dtos/user.dto';
import { EmailService } from '../../../email/services/email.service';

@Injectable()
export class AdministratorService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    // private readonly userRepo: UserRepository,
    // private readonly emailRepo: EmailRepository,
    // private readonly merchantRepo: MerchantRepository,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  async searchUser(conditions: SearchUserDTO): Promise<any> {
    const { limit, offset, filter, search, sortBy, sortDirection } = conditions;

    const usrAlias = 'u';
    const defaultFilter = [
      {
        key: 'role',
        value: [
          UserRole.SUPER_ADMIN,
          UserRole.ADMIN,
          UserRole.PUBLISHER,
          UserRole.ADVERTISER,
        ],
        alias: usrAlias,
      },
      {
        key: 'status',
        value: [UserStatus.BANNED, UserStatus.ACTIVE],
        alias: usrAlias,
      },
    ];

    const formatFilter = filter ? [...defaultFilter, ...filter] : defaultFilter;

    //  await this.userRepo.cmdUser(UserTypeCMD.SEARCH, null, {
    //   filter: formatFilter,
    //   search,
    //   ...defaultSort,
    // });
    const cond: SearchUserDTO = {
      limit,
      offset,
      filter: formatFilter,
      search,
      sortBy,
      sortDirection,
    };

    return this.userService.searchUser(cond);
  }

  async adminCreateUser(
    data: AdminCreateUserĐTO,
    currentUser: TokenUserInfo,
  ): Promise<User | null> {
    // checkAdminRolePermission(data, currentUser); 
    // const existUser = await this.userRepo.cmdUser<User | null>(
    //   UserTypeCMD.GET,
    //   [
    //     {
    //       email: data.email,
    //     },
    //     {
    //       username: data.username,
    //     },
    // ])

    const existUser = await this.userService.getUserByField([
      {
        email: data.email,
      },
      {
        fullName: data.fullName,
      },
    ]);

    if (existUser) {
      throw new ApiError(ErrorCode.USER_ALREADY_EXIST);
    }

    const randomPassword = CommonService.generateRandomPassword();

    const [createUser] = await Promise.all([
      // this.userRepo.cmdUser<User | null>(UserTypeCMD.CREATE, {
      //   ...data,
      //   password: randomPassword,
      //   emailVerified: true,
      // }),
      // this.emailRepo.sendEmail(EmailType.WELCOME, {
      //   name: data.username,
      //   email: data.email,
      //   pass: randomPassword,
      // }),

      this.userService.createUser({
        ...data,
        password: randomPassword,
        emailVerified: true,
      })
    ]);

    return createUser;
  }

  async adminUpdateUser(
    userId: number,
    updateData: AdminUpdateUserDTO,
    currentUser: TokenUserInfo,
  ): Promise<boolean> {
    if (updateData.role) checkAdminRolePermission(updateData, currentUser);

    // const user = await this.userRepo.cmdUser<User | null>(UserTypeCMD.GET, {
    //   id: userId,
    // });
    const user = await this.userService.getUserByField({ id: userId });

    if (!user) throw new ApiError(ErrorCode.USER_NOT_FOUND);
    checkAdminRolePermission(user, currentUser);

    if (this._checkRole(UserRole.ADVERTISER, user.role, updateData.role)) {
      updateData.campaign = null;
    }

    if (this._checkRole(UserRole.PUBLISHER, user.role, updateData.role)) {
      updateData.merchantId = null;
    }

    // await this.userRepo.cmdUser(UserTypeCMD.UPDATE, updateData, {
    //   id: userId,
    // });
    await this.userService.updateUser({ id: userId }, updateData);
    return true;
  }

  async adminSetPassword(
    userId: number,
    updateData: SetPasswordDTO,
    currentUser: TokenUserInfo,
  ): Promise<boolean> {
    // const user = await this.userRepo.cmdUser<User | null>(UserTypeCMD.GET, {
    //   id: userId,
    // });
    const user = await this.userService.getUserByField({ id: userId });

    if (!user) throw new ApiError(ErrorCode.USER_NOT_FOUND);
    checkAdminRolePermission(user, currentUser);

    // await this.userRepo.cmdUser(
    //   UserTypeCMD.CHANGE,
    //   { password: updateData.password },
    //   { id: user.id },
    // );

    await this.userService.changePassword(
      { id: user.id },
      { password: updateData.password },
    );

    if (user.email) {
      // await this.emailRepo.sendEmail(EmailType.SET_PASSWORD, {
      //   name: user.username,
      //   email: user.email,
      //   pass: updateData.password,
      // });
      this.emailService.sendAdminSetPassword({
        name: user.username,
        email: user.email,
        pass: updateData.password,
      });
    }

    return true;
  }

  private _checkRole(
    role: UserRole,
    userRole: UserRole,
    updateRole: UserRole,
  ): boolean {
    return userRole === role && updateRole && updateRole !== role;
  }
  async adminDeleteUser(
    userId: number,
    isHard = false,
    currentUser: TokenUserInfo,
  ) {
    // const user = await this.userRepo.cmdUser<User | null>(UserTypeCMD.GET, {
    //   id: userId,
    // });
    const user = await this.userService.getUserByField({ id: userId });
    if (!user) throw new ApiError(ErrorCode.USER_NOT_FOUND);

    checkAdminRolePermission(user, currentUser);
    // return await this.userRepo.cmdUser(
    //   UserTypeCMD.DELETE,
    //   {
    //     id: userId,
    //   },
    //   { isHard },
    // );
    return this.userService.deleteUser({ id: userId }, isHard);
  }

  async searchCampaign(
    conditions: SearchUserCampaignPageDTO,
  ): Promise<{ campaigns: { id: number; name: string }[]; total: number }> {
    const { limit, offset, search, sortBy, sortDirection } = conditions;

    //  await this.userRepo.sendCmd(UserCommands.SEARCH_USER_CAMPAIGN, {
    //   limit,
    //   offset,
    //   search,
    //   ...defaultSort,
    // });
    return this.userService.searchCampaign({
      limit,
      offset,
      search,
      sortBy,
      sortDirection,
    });
  }

  async getUserDetail(
    id: number,
  ): Promise<User & { campaign?: string; merchantName?: string }> {
    // const user = await this.userRepo.cmdUser<
    //   (User & { campaign?: string; merchantName?: string }) | null
    // >(UserTypeCMD.GET, {
    //   id,
    // });
    const user: (User & { campaign?: string; merchantName?: string }) | null =
      await this.userService.getUserByField({ id });

    if (!user) throw new ApiError(ErrorCode.USER_NOT_FOUND);

    return user;
  }
}
