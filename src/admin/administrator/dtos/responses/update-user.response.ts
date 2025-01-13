import { ApiProperty } from '@nestjs/swagger';
import { ApiResult } from '../../../../common/classes/api-result';

export class UpdateUserAPIResponseDTO extends ApiResult<boolean> {
  @ApiProperty({
    required: true,
    type: Boolean,
  })
  data: boolean;
}
