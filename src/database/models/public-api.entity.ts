import { Column, Entity, Unique } from 'typeorm';

import { BaseEntity } from '../../common/typeorm/base.entity';
import { PublicApiStatus } from '../../admin/public-api-management/constants';

export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export type VariableType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export type KeyProperty = {
  description: string;
  type: VariableType;
  required: boolean;
};

export type Headers = {
  [key: string]: KeyProperty;
};

export type Body = {
  [key: string]: KeyProperty;
};

export type Params = {
  [key: string]: KeyProperty;
};

export type Query = {
  [key: string]: KeyProperty;
};

export interface IMetaData {
  method: HTTPMethod;
  headers: Headers;
  body: Body;
  params: Params;
  query: Query;
}

@Entity({ name: 'public_api' })
@Unique(['name'])
export class PublicApi extends BaseEntity {
  @Column({ length: 100, nullable: false, type: 'varchar', name: 'name' })
  name: string;

  @Column({ nullable: false, type: 'varchar', length: 500 })
  url: string;

  @Column({ nullable: true, type: 'int4', name: 'ticket_id', default: 1 })
  ticketId: number;

  @Column({ nullable: false, type: 'int4', name: 'limit', default: 500 })
  limit: number;

  @Column({ nullable: false, type: 'int4', name: 'total_used', default: 0 })
  totalUsed: number;

  @Column({ nullable: false, type: 'varchar', length: 10 })
  code: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: PublicApiStatus,
    default: PublicApiStatus.ACTIVE,
  })
  status: PublicApiStatus;

  @Column({ nullable: false, type: 'jsonb', name: 'meta_data' })
  metaData: IMetaData;
}

export type ObjectOfPublicApi = Omit<PublicApi, 'createdAt' | 'updatedAt'>;
