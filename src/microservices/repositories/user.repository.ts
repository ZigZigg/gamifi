// import { Inject, Injectable, Logger } from '@nestjs/common';
// import { ClientProxy } from '@nestjs/microservices';

// import { AppConfig } from '../../common/constants/constants';

// import { ApiResult, ApiStatus } from '../../common/classes/api-result';
// import { ApiError } from '../../common/classes/api-error';
// import { CommandDto } from '../../common/classes/command.dto';
// import { JWTUtils } from '../../common/jwt-utils';
// import { ConfigService } from '../../common/services/config.service';
// import * as _ from 'lodash';
// import { firstValueFrom } from 'rxjs';

// export enum Commands {
//   GET_USER_BY_FIELD = 'GET_USER_BY_FIELD',
//   UPDATE_USER = 'UPDATE_USER',
//   CREATE_USER = 'CREATE_USER',
//   DELETE_USER = 'DELETE_USER',
//   LOGIN_USER_WITH_PASSWORD = 'LOGIN_USER_WITH_PASSWORD',
//   CHANGE_PASSWORD = 'CHANGE_PASSWORD',
//   SEARCH_USER = 'SEARCH_USER',

//   GET_ACCOUNT_BY_FIELD = 'GET_ACCOUNT_BY_FIELD',
//   UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
//   CREATE_ACCOUNT = 'CREATE_ACCOUNT',
//   DELETE_ACCOUNT = 'DELETE_ACCOUNT',

//   GET_OTP_BY_FIELD = 'GET_OTP_BY_FIELD',
//   UPDATE_OTP = 'UPDATE_OTP',
//   CREATE_OTP = 'CREATE_OTP',
//   DELETE_OTP = 'DELETE_OTP',

//   CHECK_VERSION = 'CHECK_VERSION',
//   LOG_ACTIVITY = 'LOG_ACTIVITY',
//   LOG_AVERAGE_TIME = 'LOG_AVERAGE_TIME',

//   SEARCH_USER_CAMPAIGN = 'SEARCH_USER_CAMPAIGN',

//   GET_USER_CAMPAIGN_BY_FIELD = 'GET_USER_CAMPAIGN_BY_FIELD',
// }

// export enum Type {
//   CREATE = 'CREATE',
//   UPDATE = 'UPDATE',
//   GET = 'GET',
//   DELETE = 'DELETE',
//   LOGIN = 'LOGIN',
//   CHANGE = 'CHANGE',
//   SEARCH = 'SEARCH',
// }

// export class KeyValuePair {
//   id: number;
//   value: any;
// }

// @Injectable()
// export class UserRepository {
//   private logger = new Logger(this.constructor.name);
//   token: string;

//   constructor(
//     @Inject(AppConfig.MICROSERVICE.USER)
//     private readonly client: ClientProxy,
//     private readonly configService: ConfigService,
//   ) {}

//   get jwt() {
//     return this.configService.jwt;
//   }

//   async getToken() {
//     return await JWTUtils.signAsync(
//       {
//         appType: AppConfig.MICROSERVICE.USER,
//       },
//       this.jwt.accessTokenSecret,
//       {
//         expiresIn: this.jwt.accessTokenExpireTime,
//       },
//     );
//   }

//   async onModuleInit() {
//     await this.client.connect();
//     this.token = await this.getToken();
//   }

//   async cmdUser<T>(
//     type: Type,
//     user: { [k: string]: any },
//     cond?: { [k: string]: any },
//     options?: { [k: string]: any },
//   ): Promise<T> {
//     let result;

//     switch (type) {
//       case Type.GET:
//         result = await this.sendCmd<T>(Commands.GET_USER_BY_FIELD, { user });
//         break;
//       case Type.CREATE:
//         result = await this.sendCmd<T>(Commands.CREATE_USER, { user });
//         break;
//       case Type.UPDATE:
//         result = await this.sendCmd(Commands.UPDATE_USER, { cond, user });
//         break;
//       case Type.DELETE:
//         result = await this.sendCmd(Commands.DELETE_USER, { user, cond });
//         break;
//       case Type.LOGIN:
//         result = await this.sendCmd(Commands.LOGIN_USER_WITH_PASSWORD, {
//           password: user.password,
//           cond: _.omit(user, ['password']),
//         });
//         break;
//       case Type.CHANGE:
//         result = await this.sendCmd(Commands.CHANGE_PASSWORD, {
//           user,
//           cond,
//           options,
//         });
//         break;
//       case Type.SEARCH:
//         result = await this.sendCmd(Commands.SEARCH_USER, { cond });
//         break;
//       default:
//         break;
//     }

//     return result;
//   }

//   async cmdAccount(
//     type: Type,
//     account: { [k: string]: any },
//     cond?: { [k: string]: any },
//   ) {
//     let result;

//     switch (type) {
//       case Type.GET:
//         result = await this.sendCmd(Commands.GET_ACCOUNT_BY_FIELD, { account });
//         break;
//       case Type.CREATE:
//         result = await this.sendCmd(Commands.CREATE_ACCOUNT, { account });
//         break;
//       case Type.UPDATE:
//         result = await this.sendCmd(Commands.UPDATE_ACCOUNT, { account, cond });
//         break;
//       case Type.DELETE:
//         result = await this.sendCmd(Commands.DELETE_ACCOUNT, { account });
//         break;
//       default:
//         break;
//     }

//     return result;
//   }

//   async cmdOtp(
//     type: Type,
//     otp: { [k: string]: any },
//     cond?: { [k: string]: any },
//   ) {
//     let result;

//     switch (type) {
//       case Type.GET:
//         result = await this.sendCmd(Commands.GET_OTP_BY_FIELD, { otp });
//         break;
//       case Type.CREATE:
//         result = await this.sendCmd(Commands.CREATE_OTP, { otp });
//         break;
//       case Type.UPDATE:
//         result = await this.sendCmd(Commands.UPDATE_OTP, { otp, cond });
//         break;
//       case Type.DELETE:
//         result = await this.sendCmd(Commands.DELETE_OTP, { otp });
//         break;
//       default:
//         break;
//     }

//     return result;
//   }

//   async sendCmd<T>(cmd: string, data: any): Promise<T> {
//     try {
//       const accessToken = await this.getToken();
//       const cmdDto = new CommandDto(accessToken, data);
//       this.logger.log('=============================');
//       this.logger.log('======== SEND CMD: ', cmd);
//       this.logger.log('CMD DATA: ', cmd);
//       this.logger.log('=============================');

//       const result = await firstValueFrom(
//         this.client.send<ApiResult<T>>({ cmd }, cmdDto),
//       );

//       if (result.status === ApiStatus.ERROR) {
//         ApiError.error(result.message);
//       }

//       return result.data;
//     } catch (e) {
//       this.logger.log('==== EMIT CMD ERROR: ', cmd, e);
//       throw ApiError.error(e);
//     }
//   }

//   async sendEvent(cmd: string, data: any) {
//     const accessToken = await this.getToken();
//     const cmdDto = new CommandDto(accessToken, data);

//     return await firstValueFrom(this.client.emit<any>(cmd, cmdDto));
//   }

//   async getVersion(flatfrom: string, version: string) {
//     return await this.sendCmd(Commands.CHECK_VERSION, { flatfrom, version });
//   }
// }
