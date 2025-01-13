import { BaseEntity } from '../../common/typeorm/base.entity';
import { Column, Entity } from 'typeorm';

export enum UserActivityType {
  ON_NETWORK = 'ON_NETWORK',
  ON_PUBLISHER_NETWORK = 'ON_PUBLISHER_NETWORK',
}

@Entity({ name: 'user_activity' })
export class UserActivity extends BaseEntity {
  @Column({ nullable: true, type: 'int4', name: 'user_id' })
  userId: number;

  @Column({
    nullable: false,
    type: 'enum',
    name: 'type',
    enum: UserActivityType,
  })
  type: UserActivityType;
}
