import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';

import {
  ObjectOfPublicApi,
  PublicApi,
} from '../../database/models/entities';
import {
  CreateDto,
  UpdateDto,
  ValidateDuplicatePublicApiDTO,
} from './dtos/requests';
import { AppConfig } from '../../common/constants/constants';
import { ApiError } from '../../common/classes/api-error';
import { DeleteType, ErrorCode, PublicApiStatus } from './constants';
import { CommonService } from '../../common/services/common.service';
import { BasePageDTO } from '../../common/classes/pagination.dto';
import { PublicApiResDTO, PublicApisResDTO } from './dtos/responses';

@Injectable()
export class PublicApiManagementService {
  constructor(
    @InjectRepository(PublicApi, AppConfig.DB)
    private readonly publicApiRepository: Repository<PublicApi>,
  ) {}


  async validateDuplicate(
    payload: ValidateDuplicatePublicApiDTO,
  ): Promise<boolean> {
    const apiKey = await this.publicApiRepository.findOneBy({
      name: payload.name,
    });
    if (apiKey) {
      return false;
    }
    return true;
  }

  async update(id: number, data: UpdateDto): Promise<UpdateResult> {
    const publicApi = await this.publicApiRepository.findOneBy({
      id,
      status: PublicApiStatus.ACTIVE,
    });
    if (!publicApi) {
      throw new ApiError(ErrorCode.PUBLIC_API_NOT_FOUND);
    }

    return this.publicApiRepository.update(
      { id },
      { limit: data.limit, name: data.name },
    );
  }

  async delete(id: number, type: DeleteType) {
    const publicApi = await this.publicApiRepository.findOneBy({
      id,
    });
    if (!publicApi) {
      throw new ApiError(ErrorCode.PUBLIC_API_NOT_FOUND);
    }

    return this.publicApiRepository.update(
      { id },
      {
        status:
          type === DeleteType.ARCHIVE
            ? PublicApiStatus.INACTIVE
            : PublicApiStatus.ACTIVE,
      },
    );
  }
}
