import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsNotEmpty,
  IsString,
  IsEmail,
  IsNumber,
  MaxLength,
  IsIn,
  MinLength,
  IsNumberString,
  Length,
  Matches,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import {
  CommonService,
  FilterOptions,
  IConvertArray,
} from '../../common/services/common.service';
import {
  User,
  UserGender,
  UserStatus,
  ignoreWithUserUpdate,
} from '../../database/models/entities';
import * as _ from 'lodash';
import {
  AppConfig,
  ErrorCode,
  NotificationTopicAction,
} from '../../common/constants/constants';
import { REGEX_CONSTANTS } from '../../common/regex.constant';
import { BasePageDTO } from '../../common/classes/pagination.dto';

const usrAlias = { alias: 'u' };

const adminPageAllowedSearch: Record<string, boolean | FilterOptions> = {
  username: usrAlias,
  full_name: usrAlias,
  email: usrAlias,
};

const adminPageAllowedFilters = {
  username: true,
  email: true,
  role: true,
  status: true,
  phone_number: true,
  province: true,
  last_active: true,
};

export class PageDTO {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @ApiProperty({ type: 'number', required: false, default: 10 })
  readonly limit: number = 10;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @ApiProperty({ type: 'number', required: false, default: 0 })
  readonly offset: number = 0;
}

export enum SortBy {
  NAME = 'name',
  CREATED_AT = 'created_at',
}

export class SearchUserDTO extends BasePageDTO {
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
    description: 'ex: FIELD_NAME',
  })
  @Transform(({ value }) =>
    CommonService.convertArray(value, adminPageAllowedSearch),
  )
  readonly search?: IConvertArray[];

  @IsOptional()
  @ApiProperty({
    type: 'array',
    isArray: true,
    required: false,
    description: `ex: FIELD_NAME,VALUE,FROM,TO.
    FIELD_NAME: Name of field in database.
    VALUE: Value of filter, value is string|number|string array, number array.
    FROM/TO: Get record between from-to by FIELD_NAME.`,
  })
  @Transform(({ value }) =>
    CommonService.convertArray(value, adminPageAllowedFilters),
  )
  readonly filter?: IConvertArray[];
}

export class UserDTO {
  @IsOptional()
  @ApiProperty({
    type: User,
    required: false,
    description: 'Condition for update',
  })
  readonly cond: { [k: string]: User };

  @IsNotEmpty()
  @ApiProperty({ description: 'Data update', type: User })
  @Transform(({ value }) => _.omit(value, ignoreWithUserUpdate))
  readonly user: { [K in keyof User]?: User[K] };
}

export class UpdateUserDTO {
  @ApiProperty({ type: 'string', nullable: true })
  @IsOptional()
  @Matches(REGEX_CONSTANTS.EMAIL, { message: ErrorCode.INVALID_EMAIL_FORMAT })
  email?: string;

  @ApiProperty({ type: 'string', nullable: true })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ type: 'enum', enum: UserGender })
  @IsEnum(UserGender)
  @IsOptional()
  gender?: UserGender;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ type: 'string', nullable: true, example: 'DD/MM/YYYY' })
  @IsOptional()
  @IsString()
  @Length(10, 10)
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ type: 'string', nullable: true })
  @IsString()
  @IsOptional()
  province?: string;

  @IsNumber()
  @IsOptional()
  loginTime?: number;

  @IsOptional()
  lastActive?: Date;

  @ApiProperty({ type: 'string', nullable: true })
  @IsString()
  @IsOptional()
  address?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEnum([UserStatus.BANNED, UserStatus.ACTIVE])
  status?: UserStatus;

  @IsOptional()
  resendOtp?: number;

  @IsOptional()
  firstSendOtp?: Date;

  @IsOptional()
  password?: string;

  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;

  @IsString()
  @IsOptional()
  hashedSubscriberId?: string;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  @IsString()
  @IsOptional()
  lastName?: string;
}

export class DeleteUserDTO {
  @IsOptional()
  @ApiProperty({ type: 'boolean', required: false, default: false })
  readonly isHard: boolean = false;
}

export class ChangePasswordDTO {
  @IsOptional()
  @ApiProperty({
    type: String,
    required: true,
    description: 'Old password',
  })
  readonly oldPassword: string;

  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: true,
    description: 'Password',
  })
  readonly password: string;
}

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNumberString()
  @IsNotEmpty()
  @Length(11)
  phoneNumber: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  departmentId: number;

  @ApiProperty()
  @IsIn(AppConfig.AUTHORITY)
  authority: string;

  @ApiProperty()
  @IsNumberString()
  @IsOptional()
  @MaxLength(10)
  @MinLength(9)
  officeNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(50)
  bank: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(50)
  accountHolder: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(18)
  @MinLength(9)
  bankAccount: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(13)
  regisNumber: string;
}

export class ValidateUniqueUserDto {
  @ApiPropertyOptional({ type: 'string', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ type: 'string', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ type: 'string', required: false })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  email?: string;
}

export class UserTicket {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(6)
  walletNumber: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  total: number;
}

export class GetUserProfile {
  profile: User;
  ticket: UserTicket;
}

export class SubNewsLetterPayload {
  @ApiProperty({
    type: 'enum',
    enum: NotificationTopicAction,
    default: NotificationTopicAction.SUBSCRIBE,
    required: true,
  })
  @IsEnum(NotificationTopicAction)
  @IsNotEmpty()
  action: NotificationTopicAction = NotificationTopicAction.SUBSCRIBE;
}
