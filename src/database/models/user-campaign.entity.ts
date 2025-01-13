import { BaseEntity } from '../../common/typeorm/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './entities';

@Entity({ name: 'user_campaign' })
export class UserCampaign extends BaseEntity {
  @Column({ nullable: false, type: 'integer', name: 'user_id' })
  userId: number;

  @Column({ nullable: false, type: 'varchar', name: 'campaign', length: 100 })
  campaign: string;

  @OneToOne(() => User, (user) => user.userCampaign)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
