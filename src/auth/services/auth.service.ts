import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as _ from 'lodash';
import * as moment from 'moment';
import { HmacSHA256 } from 'crypto-js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  AppConfig,
  ConvertPhoneNumAction,
  ErrorCode,
  NotificationEvent,
} from '../../common/constants/constants';
import { ApiError } from '../../common/classes/api-error';
import { ConfigService } from '../../common/services/config.service';
import { CommonService } from '../../common/services/common.service';

import {
  LoginDTO,
  RegisterDTO,
  ResetPasswordDTO,
  UserSocialDto,
  LoginSocialDTO,
  UserStatus,
  AccountType,
  Flatfrom,
  LoginByPhoneDTO,
  VerifyLinkType,
  TokenUserInfo,
} from '../dtos';


import {
  UserActivityType,
  User,
  EmailType,
  UserRole,
  PublicApiLogs,
  PublicApiLogsStatus,
} from '../../database/models/entities';
import { RedisClientService } from '../../common/services/redis.service';
import {
  StatusCanNotLogin,
  StatusCanNotRegister,
  StatusCanNotSendOTP,
} from '../constants/constant';
import {
  AccountService,
  MasterService,
  UserService,
} from '../../user/services';
import { NoticeService } from '../../notice/services/notice.service';
import { EmailService } from '../../email/services/email.service';
import { JWTUtils } from '../../common/jwt-utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EncryptService } from '../../common/services/encrypt.service';
import {
  TriggerWorkflowEvent,
} from '../../common/dtos/events';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(this.constructor.name);
  constructor(

    private readonly userService: UserService,
  ) {}

  async register(data: RegisterDTO) {
    // let user = await this.userRep.cmdUser<User>(UserTypeCMD.GET, {
    //   email: data.email,
    // });
    let user = await this.userService.getUserByField({ email: data.email });

    // user = await this.userRep.cmdUser(UserTypeCMD.CREATE, { ...data });
    user = await this.userService.createUser({ ...data });

    return;
  }


}
