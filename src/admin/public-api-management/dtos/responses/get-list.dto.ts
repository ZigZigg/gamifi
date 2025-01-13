import { ApiProperty } from '@nestjs/swagger';

import { PublicApiStatus } from '../../constants';
import { ApiResult } from '../../../../common/classes/api-result';

export class PublicApiResDTO {
  @ApiProperty({ type: 'number', example: 1 })
  id: number;

  @ApiProperty({ type: 'string', example: 'Public api name' })
  name: string;

  @ApiProperty({ type: 'string', example: '/jdf9uxntLS/coupon' })
  url: string;

  @ApiProperty({ type: 'string', example: 'jdf9uxntLS' })
  code: string;

  @ApiProperty({ type: 'enum', example: PublicApiStatus.ACTIVE })
  status: PublicApiStatus;

  @ApiProperty({ type: 'number', example: 500 })
  limit: number;
}

export class PublicApisResDTO {
  @ApiProperty({ type: [PublicApiResDTO] })
  readonly publicApis: PublicApiResDTO[];

  @ApiProperty({ type: 'number' })
  readonly total: number;
}

export class GetPublicApisResDTO extends ApiResult<PublicApisResDTO> {
  @ApiProperty({ required: true, type: PublicApisResDTO })
  data: PublicApisResDTO;

  public static success(data: PublicApisResDTO) {
    const result = new GetPublicApisResDTO();
    result.success(data);
    return result;
  }
}
