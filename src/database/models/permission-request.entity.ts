import { BaseEntity } from '../../common/typeorm/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './entities';

export enum PermissionRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity({ name: 'permission_request' })
export class PermissionRequest extends BaseEntity {
  @Column({
    nullable: false,
    type: 'enum',
    enum: PermissionRequestStatus,
    default: PermissionRequestStatus.PENDING,
  })
  status: PermissionRequestStatus;

  @Column({ nullable: false, type: 'integer', name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.permissionRequests)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
