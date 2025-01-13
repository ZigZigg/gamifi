import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../../database/models/entities';
import { ApiResult } from '../../../../common/classes/api-result';

export class CreateUserApiResponseDTO extends ApiResult<User> {
  @ApiProperty({
    required: true,
    type: User,
  })
  data: User;
}
