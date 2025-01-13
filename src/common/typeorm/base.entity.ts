import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface Media {
  type: MediaTypeEnum;
  url: string;
}

export interface MetaData {
  img?: {
    type: MediaTypeEnum | '';
    url: string;
  };
  video?: {
    type: MediaTypeEnum | '';
    url: string;
  };
}

export enum MediaTypeEnum {
  UPLOAD = 'UPLOAD',
  URL = 'URL',
}

@Entity()
export class BaseEntity {
  @PrimaryGeneratedColumn('increment')
  @ApiProperty()
  @Index({ unique: true })
  id: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
    nullable: false,
  })
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    name: 'created_at',
    example: '2021-09-01T00:00:00.000Z',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
    nullable: false,
  })
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    name: 'updated_at',
    example: '2021-09-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
