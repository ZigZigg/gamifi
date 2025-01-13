import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum Flatfrom {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}

export class VersionMetadata {
  @ApiProperty()
  version: string;

  @ApiProperty()
  isForce = false;
}

export class Version {
  @ApiProperty()
  IOS: VersionMetadata[];

  @ApiProperty()
  ANDROID: VersionMetadata[];
}

export class Value {
  @ApiProperty()
  val: string;
}

export enum Key {
  VERSION = 'VERSION',
}

@Entity()
export class Master {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ length: 50 })
  @ApiProperty()
  key: Key;

  @Column('simple-json', { nullable: true })
  @ApiProperty({ type: 'object' })
  value: Version | Value;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ type: 'string', format: 'date-time', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ type: 'string', format: 'date-time', name: 'updated_at' })
  updatedAt: Date;
}

export type ObjectOfMaster = Omit<Master, 'createdAt' | 'updatedAt'>;
