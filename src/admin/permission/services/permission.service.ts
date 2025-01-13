import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppConfig, ErrorCode } from '../../../common/constants/constants';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../../../database/models/user.entity';
import {
  SearchPermissionRequestDTO,
  UpdatePermissionRequestDTO,
} from '../dtos/requests';
import {
  PermissionRequest,
  PermissionRequestStatus,
} from '../../../database/models/permission-request.entity';
import {
  IUserRole,
  checkAdminRolePermission,
} from '../../auth/common/common.function';
import { ApiError } from '../../../common/classes/api-error';
import { TokenUserInfo } from '../../../auth/dtos';
import { ISearchPermissionRequest } from '../dtos/responses';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectRepository(PermissionRequest, AppConfig.DB)
    private readonly permissionRequestRepo: Repository<PermissionRequest>,
  ) {}

  async createPermissionRequest(
    userId: number,
  ): Promise<PermissionRequest | boolean> {
    const existRequest = await this.permissionRequestRepo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    if (
      existRequest &&
      existRequest.status === PermissionRequestStatus.PENDING
    ) {
      throw new ApiError(ErrorCode.PERMISSION_REQUEST_IS_PENDING);
    }
    if (
      existRequest &&
      existRequest.status === PermissionRequestStatus.APPROVED
    ) {
      return true;
    }
    return this.permissionRequestRepo.save({
      userId,
    });
  }

  private permissionRequestQueryBuilder() {
    return this.permissionRequestRepo
      .createQueryBuilder('pr')
      .select(
        'pr.id, pr.status, pr.created_at as "createdAt", u.id as "userId", u.username, u.email, u.role',
      )
      .innerJoin(User, 'u', `u.id = pr.user_id and u.status <> :userStatus`, {
        userStatus: UserStatus.DELETED,
      });
  }

  async searchPermissionRequest(
    data: SearchPermissionRequestDTO,
  ): Promise<ISearchPermissionRequest> {
    const { limit, offset, filter, search } = data;

    const queryBuilder = this.permissionRequestQueryBuilder();

    if (search) {
      CommonService.handleSearchQuery<PermissionRequest>(search, queryBuilder);
    }

    if (filter) {
      CommonService.handleFilterQuery<PermissionRequest>(filter, queryBuilder);
    }

    const [total, permissionRequests] = await Promise.all([
      queryBuilder.clone().getCount(),
      queryBuilder.limit(limit).offset(offset).getRawMany(),
    ]);

    return {
      permissionRequests,
      total,
    };
  }

  async updatePermissionRequest(
    permissionReqId: number,
    updateData: UpdatePermissionRequestDTO,
    currentUser: TokenUserInfo,
  ) {
    const permissionReq = await this.permissionRequestQueryBuilder()
      .andWhere('pr.id = :permissionReqId and pr.status = :status', {
        permissionReqId,
        status: PermissionRequestStatus.PENDING,
      })
      .getRawOne();

    if (!permissionReq)
      throw new ApiError(ErrorCode.PERMISSION_REQUEST_NOT_FOUND);

    checkAdminRolePermission(permissionReq as IUserRole, currentUser);

    await this.permissionRequestRepo.save({
      id: permissionReqId,
      ...updateData,
    });

    return true;
  }

  async checkRequestStatus(userId: number): Promise<PermissionRequest | null> {
    return this.permissionRequestRepo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
