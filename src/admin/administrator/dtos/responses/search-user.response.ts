import { ApiProperty } from '@nestjs/swagger';
import { ApiResult } from '../../../../common/classes/api-result';
import { User } from '../../../../database/models/user.entity';

export class SearchUserResponseDTO {
  @ApiProperty({
    type: [User],
  })
  users: User[];

  @ApiProperty()
  total: number;
}

export class SearchUserAPIResponseDTO extends ApiResult<SearchUserResponseDTO> {
  @ApiProperty({
    required: true,
    type: SearchUserResponseDTO,
    isArray: true,
  })
  data: SearchUserResponseDTO;
}
