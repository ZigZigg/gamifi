import {
  Entity,
  Column,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import * as bcrypt from 'bcrypt';
import { Exclude, Transform } from 'class-transformer';
import * as moment from 'moment';

import { Account, UserCampaign } from './entities';
import { BaseEntity } from '../../common/typeorm/base.entity';
import { PermissionRequest } from './permission-request.entity';
import { RewardHistory } from './reward-history.entity';
export enum UserRole {
  ADMIN = 'ADMIN',
  FRANCHISE = 'FRANCHISE',
  USER = 'USER',
  SUPER_ADMIN = 'SUPER_ADMIN',
  PUBLISHER = 'PUBLISHER',
  ADVERTISER = 'ADVERTISER',
}

export enum UserGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
  DELETED = 'DELETED',
}

@Entity()
export class User extends BaseEntity {
  @Column({ length: 255, nullable: true, unique: true })
  @ApiProperty()
  email: string;

  @Column({ length: 255, nullable: true })
  @Exclude()
  password: string;

  @Column({ length: 100, default: '', nullable: true, name: 'first_name' })
  @ApiProperty()
  firstName: string;

  @Column({ length: 100, default: '', nullable: true, name: 'last_name' })
  @ApiProperty()
  lastName: string;

  @Column({ nullable: true })
  @ApiProperty()
  avatar: string;

  @Column({ length: 5, nullable: true, name: 'phone_code' })
  @ApiProperty()
  phoneCode: string;

  @Column({ length: 15, nullable: true, name: 'phone_number', unique: true })
  @ApiProperty()
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: UserGender,
    nullable: true,
  })
  @ApiProperty()
  gender: UserGender;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  @ApiProperty()
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  @ApiProperty()
  status: UserStatus;

  @Column({ name: 'email_verified', default: false })
  @ApiProperty()
  emailVerified: boolean;

  @Column({ length: 255, nullable: true, name: 'username', unique: true })
  @ApiProperty()
  username: string;

  @Column({ length: 255, nullable: true, name: 'full_name' })
  @ApiProperty()
  fullName: string;

  @Column({
    type: 'date',
    nullable: true,
    name: 'date_of_birth',
  })
  @ApiProperty()
  dateOfBirth: string;

  @Column({ type: 'varchar', nullable: true, name: 'country', length: 255 })
  @ApiProperty()
  country: string;

  @Column({ type: 'varchar', nullable: true, name: 'province', length: 255 })
  @ApiProperty()
  province: string;

  @Column({ type: 'timestamp', nullable: true, name: 'last_active' })
  @ApiProperty()
  lastActive: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  @Transform(({ value }) => moment(value).unix())
  @ApiProperty({ type: 'number', example: 1546300800 })
  deletedAt: Date;

  @Column({ type: 'integer', nullable: false, name: 'login_time', default: 0 })
  @ApiProperty()
  loginTime: number;

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];

  @OneToMany(() => PermissionRequest, (permissionReq) => permissionReq.user)
  permissionRequests: PermissionRequest[];

  @OneToOne(() => UserCampaign, (userCampaign) => userCampaign.user)
  userCampaign: UserCampaign;

  @OneToMany(() => RewardHistory, (rewardHistory) => rewardHistory.user)
  rewardHistories: RewardHistory[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(this.password, salt);
        this.password = hash;
      } catch (error) {
        // console.log(error);
      }
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!this.password) {
      return false;
    }
    return bcrypt.compare(password, this.password);
  }
}

export type ObjectOfUser = Omit<
  User,
  | 'accounts'
  | 'createdAt'
  | 'updatedAt'
  | 'hashPassword'
  | 'validatePassword'
  | 'lastActive'
> & {
  campaign?: string;
};

export const ignoreWithUserUpdate = [
  'id',
  'password',
  'role',
  'status',
  'emailVerified',
  'lastActive',
  'deletedAt',
  'createdAt',
  'updatedAt',
];
