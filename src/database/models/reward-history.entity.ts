import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Rewards } from './rewards.entity';

@Entity('reward_history')
export class RewardHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.rewardHistories, { nullable: false })
  user: User;

  @ManyToOne(() => Rewards, { nullable: false })
  reward: Rewards;

  @Column({ type: 'timestamp', name: 'receive_date' })
  receiveDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ type: 'string', format: 'date-time', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ type: 'string', format: 'date-time', name: 'updated_at' })
  updatedAt: Date;
}