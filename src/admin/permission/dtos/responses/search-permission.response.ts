import { PermissionRequestStatus } from '../../../../database/models/permission-request.entity';
import { UserRole } from '../../../../database/models/user.entity';

export interface ISearchPermissionRequestData {
  id: number;
  status: PermissionRequestStatus;
  createdAt: Date;
  userId: number;
  username: string;
  email: string;
  role: UserRole;
}

export interface ISearchPermissionRequest {
  permissionRequests: ISearchPermissionRequestData[];
  total: number;
}
