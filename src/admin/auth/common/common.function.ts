import { UserRole } from '../../../database/models/user.entity';
import { TokenUserInfo } from '../../../auth/dtos';
import { ApiError } from '../../../common/classes/api-error';
import { ErrorCode } from '../../../common/constants/errors';

export interface IUserRole {
  role: UserRole;
}

export function checkAdminRolePermission(
  data: IUserRole,
  currentUser: TokenUserInfo,
) {
  const allowedAdminCreateRoles = [UserRole.ADVERTISER, UserRole.PUBLISHER];
  if (
    currentUser.role === UserRole.ADMIN &&
    !allowedAdminCreateRoles.includes(data.role)
  ) {
    throw new ApiError(ErrorCode.INVALID_ROLE);
  }
}
