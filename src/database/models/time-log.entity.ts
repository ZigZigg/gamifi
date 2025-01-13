import { BaseEntity } from '../../common/typeorm/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'time_log' })
export class TimeLog extends BaseEntity {
  @Column({ nullable: false, name: 'user_id', type: 'integer' })
  userId: number;

  @Column({
    nullable: false,
    name: 'start_time',
    default: () => 'CURRENT_TIMESTAMP',
    type: 'timestamp',
  })
  startTime: Date;

  @Column({ nullable: true, name: 'end_time', type: 'timestamp' })
  endTime: Date;

  @Column({
    nullable: true,
    name: 'duration',
    type: 'integer',
  })
  duration: number;
}
