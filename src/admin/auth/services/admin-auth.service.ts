import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ChangePasswordDTO, LoginDTO } from '../dtos';
// import { UserRepository } from '../../../microservices/repositories/user.repository';
// import { Type as UserTypeCMD } from '../../../microservices/repositories/user.repository';
import { ApiError } from '../../../common/classes/api-error';
import { ErrorCode } from '../../../common/constants/errors';
import {
  User,
  UserRole,
  UserStatus,
} from '../../../database/models/user.entity';
import { StatusCanNotLogin } from '../constants/constant';
import { UserService } from '../../../user/services';

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    // private readonly userRepo: UserRepository,
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(data: LoginDTO) {
    // const user = await this.userRepo.cmdUser<User | null>(UserTypeCMD.GET, {
    //   email: data.email,
    // });
    const user = await this.userService.getUserByField({ email: data.email });

    if (!user || user.role === UserRole.USER)
      throw new ApiError(ErrorCode.USER_NOT_FOUND);

    if (
      this._checkStatusCanNotLogin(
        user,
        StatusCanNotLogin.USER_DELETED_OR_BANNER,
      )
    )
      throw new ApiError(ErrorCode.USER_DELETED_OR_BANNER);

    if (
      this._checkStatusCanNotLogin(user, StatusCanNotLogin.USER_WAITING_VERIFY)
    )
      throw new ApiError(ErrorCode.USER_WAITING_VERIFY);

    if (
      this._checkStatusCanNotLogin(
        user,
        StatusCanNotLogin.EMAIL_HAS_LINKED_SOCIAL,
      )
    ) {
      throw new ApiError(ErrorCode.EMAIL_HAS_LINKED_SOCIAL);
    }

    // const check = await this.userRepo.cmdUser(UserTypeCMD.LOGIN, data);
    const check = await this.userService.loginWithPassword(data.password, {
      id: user.id,
    });

    if (!check) throw new ApiError(ErrorCode.WRONG_USER_OR_PASSWORD);

    const payload = {
      id: user.id,
      email: user.email ? user.email : null,
      role: user.role,
      lm: 'EMAIL',
    };

    // await this.userRepo.cmdUser(
    //   UserTypeCMD.UPDATE,
    //   {
    //     loginTime: user.loginTime + 1,
    //     lastActive: new Date(),
    //   },
    //   {
    //     id: user.id,
    //   },
    // );
    await this.userService.updateUser(
      { id: user.id },
      {
        loginTime: user.loginTime + 1,
        lastActive: new Date(),
      },
    );

    return {
      user,
      token: this.jwtService.sign(payload),
    };
  }

  private _checkStatusCanNotLogin(
    user: User,
    status: StatusCanNotLogin,
  ): boolean {
    switch (status) {
      case StatusCanNotLogin.USER_DELETED_OR_BANNER:
        return (
          user.status === UserStatus.DELETED ||
          user.status === UserStatus.BANNED
        );
      case StatusCanNotLogin.USER_WAITING_VERIFY:
        return user.status === UserStatus.PENDING;
      case StatusCanNotLogin.EMAIL_HAS_LINKED_SOCIAL:
        return user && user.status === UserStatus.ACTIVE && !user.emailVerified;
      default:
        return true;
    }
  }

  async changePassword(data: ChangePasswordDTO, userId: number) {
    const { oldPassword, newPassword } = data;

    // const user = await this.userRepo.cmdUser<User | null>(UserTypeCMD.GET, {
    //   id: userId,
    // });
    const user = await this.userService.getUserByField({ id: userId });

    if (!user) throw new ApiError(ErrorCode.USER_NOT_FOUND);

    //  await this.userRepo.cmdUser(
    //   UserTypeCMD.CHANGE,
    //   { password: newPassword },
    //   { id: user.id },
    //   { oldPassword },
    // );
    return this.userService.changePassword(
      { id: user.id },
      { password: newPassword },
      oldPassword,
    );
  }
}
