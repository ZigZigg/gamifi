import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum EmailStatus {
  PENDING = 'PENDING',
  DONE = 'DONE',
  FAILED = 'FAILED',
}

export enum EmailType {
  VERIFY = 'VERIFY',
  RESET = 'RESET',
  WELCOME = 'WELCOME',
  WELCOME_WITH_LOGIN = 'WELCOME_WITH_LOGIN',
  SET_PASSWORD = 'SET_PASSWORD',
  GET_TICKET_FROM_INVITE_FRIEND = 'GET_TICKET_FROM_INVITE_FRIEND',
  RECEIVE_GIFT_LINK = 'RECEIVE_GIFT_LINK',
}

@Entity()
export class Email {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  to: string;

  @Column()
  @ApiProperty()
  title: string;

  @Column()
  @ApiProperty()
  content: string;

  @Column({
    default: EmailType.WELCOME,
  })
  @ApiProperty()
  type: EmailType;

  @Column({
    type: 'enum',
    enum: EmailStatus,
    default: EmailStatus.PENDING,
  })
  @ApiProperty()
  status: EmailStatus;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ type: 'string', format: 'date-time', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ type: 'string', format: 'date-time', name: 'updated_at' })
  updatedAt: Date;
}
