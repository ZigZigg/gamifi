import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { User } from './user.entity';
import { BaseEntity } from '../../common/typeorm/base.entity';

export enum AccountType {
  FACEBOOK = 'FACEBOOK',
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',
  INSTAGRAM = 'INSTAGRAM',
  TWITTER = 'TWITTER',
  MICROSOFT = 'MICROSOFT',
}

@Entity()
export class Account extends BaseEntity {
  @Column({ name: 'user_id' })
  @ApiProperty()
  userId: number;

  @Column({ nullable: true })
  @ApiProperty()
  name: string;

  @Column({ nullable: true })
  @ApiProperty()
  token: string;

  @Column({ length: 255, nullable: true, name: 'account_id' })
  @ApiProperty()
  accountId: string;

  @Column({
    type: 'enum',
    enum: AccountType,
  })
  @ApiProperty()
  type: AccountType;

  @ManyToOne(() => User, (user) => user.accounts)
  @JoinColumn({ name: 'user_id' })
  @ApiProperty()
  user: User;
}

export type ObjectOfAccount = Omit<Account, 'user' | 'createdAt' | 'updatedAt'>;
