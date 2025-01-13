import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { BasePageDTO } from '../../../../common/classes/pagination.dto';
import { Transform } from 'class-transformer';
import {
  CommonService,
  FilterOptions,
  IConvertArray,
} from '../../../../common/services/common.service';

const userAlias = 'u';
const allowedFilters: Record<string, boolean | FilterOptions> = {
  role: { alias: userAlias },
};

const allowedSearch = {
  username: { alias: userAlias },
  email: { alias: userAlias },
};

export class SearchPermissionRequestDTO extends BasePageDTO {
  @IsOptional()
  @ApiProperty({
    type: 'array',
    isArray: true,
    required: false,
    description: `
      ex: FIELD_NAME,VALUE,FROM,TO.
      FIELD_NAME: Name of field in database.
      VALUE: Value of filter, value is string|number|string array, number array.
      FROM/TO: Get record between from-to by FIELD_NAME.`,
  })
  @Transform(({ value }) => CommonService.convertArray(value, allowedFilters))
  filter: IConvertArray[];

  @IsOptional()
  @ApiProperty({
    type: 'array',
    isArray: true,
    required: false,
    description: `
        ex: FIELD_NAME,VALUE,FROM,TO.
        FIELD_NAME: Name of field in database.
        VALUE: Value of filter, value is string|number|string array, number array.
        FROM/TO: Get record between from-to by FIELD_NAME.`,
  })
  @Transform(({ value }) => CommonService.convertArray(value, allowedSearch))
  search: IConvertArray[];
}
