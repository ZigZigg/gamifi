// import { Inject, Injectable } from '@nestjs/common';
// import { ClientProxy } from '@nestjs/microservices';

// import { AppConfig } from '../../common/constants/constants';
// import { ErrorCode } from '../../common/constants/errors';

// import { ApiResult, ApiStatus } from '../../common/classes/api-result';
// import { ApiError } from '../../common/classes/api-error';
// import { CommandDto } from '../../common/classes/command.dto';
// import { JWTUtils } from '../../common/jwt-utils';
// import { ConfigService } from '../../common/services/config.service';
// import { LoggerFactory } from '../../common/services/logger.service';
// import { firstValueFrom } from 'rxjs';

// export enum Commands {
//   SEND_EMAIL = 'SEND_EMAIL',
// }

// export enum EmailType {
//   VERIFY = 'VERIFY',
//   RESET = 'RESET',
//   WELCOME = 'WELCOME',
//   WELCOME_WITH_LOGIN = 'WELCOME_WITH_LOGIN',
//   SET_PASSWORD = 'SET_PASSWORD',
// }

// export class KeyValuePair {
//   id: number;
//   value: any;
// }

// export class EmailData {
//   email: string;
//   token?: string;
//   name?: string;
//   pass?: string;
//   password?: string;
// }

// @Injectable()
// export class EmailRepository {
//   private logger = LoggerFactory.create(this.constructor.name);
//   token: string;

//   constructor(
//     @Inject(AppConfig.MICROSERVICE.EMAIL)
//     private readonly client: ClientProxy,
//     private readonly configService: ConfigService,
//   ) {}

//   get jwt() {
//     return this.configService.jwt;
//   }

//   async getToken() {
//     return await JWTUtils.signAsync(
//       {
//         appType: AppConfig.MICROSERVICE.EMAIL,
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

//   async sendEmail(type: EmailType, payload: EmailData) {
//     return await this.sendCmd(Commands.SEND_EMAIL, { payload, type });
//   }

//   async sendCmd<T>(cmd: string, data: any): Promise<any> {
//     try {
//       const accessToken = await this.getToken();
//       const cmdDto = new CommandDto(accessToken, data);

//       const result = await firstValueFrom(
//         this.client.send<ApiResult<T>>({ cmd }, cmdDto),
//       );

//       if (result.status === ApiStatus.ERROR) {
//         ApiError.error(result.message);
//       }
//       return result.data;
//     } catch (e) {
//       this.logger.log('==== EMIT CMD ERROR: ', cmd, e);
//       throw ApiError.error(ErrorCode.SEND_CMD_ERROR);
//     }
//   }

//   async sendEvent(cmd: string, data: any) {
//     const accessToken = await this.getToken();
//     const cmdDto = new CommandDto(accessToken, data);

//     return await firstValueFrom(this.client.emit<any>(cmd, cmdDto));
//   }
// }
