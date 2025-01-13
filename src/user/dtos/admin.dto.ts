import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ErrorCode } from '../../common/constants/errors';
import { UserRole } from '../../database/models/user.entity';
import { REGEX_CONSTANTS } from '../../common/regex.constant';
import {
  CommonService,
  IConvertArray,
} from '../../common/services/common.service';
import { Transform } from 'class-transformer';
import { BasePageDTO } from '../../common/classes/pagination.dto';

export class AdminCreateUserĐTO {
  @ApiProperty({ type: 'string', nullable: false })
  @IsNotEmpty()
  @IsString()
  @Matches(REGEX_CONSTANTS.EMAIL, { message: ErrorCode.INVALID_EMAIL_FORMAT })
  @MaxLength(50)
  email: string;

  @ApiProperty({ type: 'string', nullable: false })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  username: string;

  @ApiProperty({ type: 'string', nullable: false, enum: UserRole })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}

export class AdminUpdateUserDTO {
  @ApiProperty({ type: 'string', nullable: true })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  username: string;

  @ApiProperty({ type: 'string', nullable: true, enum: UserRole })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}

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
