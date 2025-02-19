import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Rewards } from './rewards.entity';

export enum RewardVipStatus {
    PENDING='PENDING',
    REDEEMED='REDEEMED',
  }

@Entity('reward_vip')
export class RewardVip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    type: 'enum',
    enum: RewardVipStatus,
    default: RewardVipStatus.PENDING,
    name: 'status'
  })
  status: RewardVipStatus;

  @Column({ length: 15, nullable: true, name: 'phone_number', unique: true })
  @ApiProperty()
  phoneNumber: string;

  @ManyToOne(() => Rewards, { nullable: false })
  reward: Rewards;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ type: 'string', format: 'date-time', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ type: 'string', format: 'date-time', name: 'updated_at' })
  updatedAt: Date;
}