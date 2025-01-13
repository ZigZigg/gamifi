import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { BaseEntity } from '../../common/typeorm/base.entity';

export enum PublicApiLogsStatus {
  PENDING_LOGIN = 'PENDING_LOGIN',
  SUCCESS_LOGIN = 'SUCCESS_LOGIN',
  FAILED_LOGIN = 'FAILED_LOGIN',
}

@Entity({ name: 'public_api_logs' })
@Unique(['code', 'email', 'actionId'])
export class PublicApiLogs extends BaseEntity {
  @Column({ nullable: false, type: 'varchar', length: 10 })
  code: string;

  @Column({ nullable: false, type: 'varchar', length: 100 })
  email: string;

  @Column({
    nullable: false,
    type: 'varchar',
    length: 20,
    name: 'phone_number',
    unique: true,
  })
  phoneNumber: string;

  @Column({
    nullable: false,
    type: 'int4',
    name: 'action_id',
  })
  actionId: number;

  @Column({
    nullable: false,
    type: 'enum',
    enum: PublicApiLogsStatus,
    default: PublicApiLogsStatus.PENDING_LOGIN,
  })
  status: PublicApiLogsStatus;
}
