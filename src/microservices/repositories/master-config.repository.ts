// import { Inject, Injectable, Logger } from '@nestjs/common';
// import { ClientProxy } from '@nestjs/microservices';

// import { AppConfig } from '../../common/constants/constants';

// import { ApiResult, ApiStatus } from '../../common/classes/api-result';
// import { ApiError } from '../../common/classes/api-error';
// import { CommandDto } from '../../common/classes/command.dto';
// import { JWTUtils } from '../../common/jwt-utils';
// import { ConfigService } from '../../common/services/config.service';
// import { firstValueFrom } from 'rxjs';

// export enum Commands {
//   GET_MASTER_CONFIG_DETAIL = 'GET_MASTER_CONFIG_DETAIL',
//   UPDATE_MASTER_CONFIG = 'UPDATE_MASTER_CONFIG',
// }

// export enum Type {
//   CREATE = 'CREATE',
//   UPDATE = 'UPDATE',
//   GET = 'GET',
//   DELETE = 'DELETE',
// }

// export class KeyValuePair {
//   id: number;
//   value: any;
// }

// @Injectable()
// export class MasterConfigRepository {
//   private logger = new Logger(this.constructor.name);
//   token: string;

//   constructor(
//     @Inject(AppConfig.MICROSERVICE.MASTER_CONFIG)
//     private readonly client: ClientProxy,
//     private readonly configService: ConfigService,
//   ) {}

//   get jwt() {
//     return this.configService.jwt;
//   }

//   async getToken() {
//     return await JWTUtils.signAsync(
//       {
//         appType: AppConfig.MICROSERVICE.MASTER_CONFIG,
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
// }
