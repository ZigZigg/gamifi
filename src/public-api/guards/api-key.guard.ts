import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PublicApi } from '../../database/models/entities';
import { ErrorCode } from '../constants';
import { EncryptService } from '../../common/services/encrypt.service';
import { ConfigService } from '../../common/services/config.service';
import { AppConfig } from '../../common/constants/constants';
import { ApiError } from '../../common/classes/api-error';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(

    @InjectRepository(PublicApi, AppConfig.DB)
    private readonly publicApiRepository: Repository<PublicApi>,
    private readonly encryptService: EncryptService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const UUID_WITHOUT_DASH_LENGTH = 32;
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const tenantCode = request.headers['tenant-code'];

    const isValidApiKey = apiKey && apiKey.length === UUID_WITHOUT_DASH_LENGTH;
    const isValidTenantCode =
      tenantCode && tenantCode.length === UUID_WITHOUT_DASH_LENGTH;
    if (!isValidApiKey || !isValidTenantCode) {
      throw new ApiError(ErrorCode.INVALID_API_KEY_OR_TENANT_CODE);
    }

    const existingApiKey = await this.findApiKey(apiKey, tenantCode);
    if (!existingApiKey) {
      throw new ApiError(ErrorCode.API_KEY_NOT_FOUND);
    }

    const publicApiCode = await this.getPublicApiCode(request.url);
    request.headers['public-api-code'] = publicApiCode;
    return true;
  }

  private async findApiKey(
    apiKey: string,
    tenantCode: string,
  ): Promise<any> {
    const hashedApiKey = this.encryptService.hash(
      apiKey,
      this.configService.apiKey.salt,
    );
    return true
  }

  private async getPublicApiCode(url: string): Promise<string> {
    const publicApi = await this.publicApiRepository.findOneBy({
      url,
    });
    if (!publicApi) {
      throw new ApiError(ErrorCode.PUBLIC_API_NOT_FOUND);
    }

    return publicApi.code;
  }
}
