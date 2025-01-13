import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import * as moment from 'moment';

export interface Metadata {
  id: string;
  html: string;
}

export enum NotificationType {
  SYSTEM_NOTICE = 'SYSTEM_NOTICE',
  WEBVIEW = 'WEBVIEW',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  DONE = 'DONE',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'account_id' })
  @ApiProperty()
  userId: number;

  @Column()
  @ApiProperty()
  title: string;

  @Column()
  @ApiProperty()
  body: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM_NOTICE,
  })
  @ApiProperty({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  @ApiProperty({ type: 'enum', enum: NotificationStatus })
  status: NotificationStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'readed_at' })
  @Transform(({ value }) => moment(value).unix())
  @ApiProperty({ type: 'number', example: 1546300800 })
  readedAt: Date;

  @Column({
    type: 'jsonb',
  })
  metadata: Metadata;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ type: 'string', format: 'date-time', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ type: 'string', format: 'date-time', name: 'updated_at' })
  updatedAt: Date;
}
