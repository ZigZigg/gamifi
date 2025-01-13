import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { BasePageDTO } from '../../../../common/classes/pagination.dto';
import {
  CommonService,
  FilterOptions,
  IConvertArray,
} from '../../../../common/services/common.service';
import { SearchUserDTO } from '../../../../user/dtos/user.dto';

const usrAlias = { alias: 'u' };
const allowedFilters: Record<string, boolean | FilterOptions> = {
  role: usrAlias,
};

const allowedSearch: Record<string, boolean | FilterOptions> = {
  full_name: usrAlias,
  email: usrAlias,
};

export enum SortBy {
  NAME = 'name',
  CREATED_AT = 'created_at',
}

export class SearchUserCampaignPageDTO extends BasePageDTO {
  @ApiProperty({
    required: false,
    type: 'enum',
    enum: SortBy,
    default: SortBy.NAME,
  })
  @IsEnum(SortBy)
  @IsNotEmpty()
  @IsOptional()
  sortBy?: SortBy = SortBy.NAME;

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
  @Transform(({ value }) => CommonService.convertArray(value))
  search: IConvertArray[];
}

export class SearchAdminPageDTO extends SearchUserDTO {
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
}
