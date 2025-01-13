import { UserRole } from '../../database/models/user.entity';

export interface TokenUserInfo {
  id: number;
  email: string;
  role: UserRole;
  lm: string;
  phoneNumber?: string;
  subId?: string;
  subIdHash?: string;
}
