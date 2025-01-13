import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNumber,
  IsNotEmptyObject,
  ValidateNested,
} from 'class-validator';
import { CommonService } from '../../../common/services/common.service';
import { ConvertPhoneNumAction } from '../../../common/constants/constants';

export enum AccountType {
  FACEBOOK = 'FACEBOOK',
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',
  INSTAGRAM = 'INSTAGRAM',
  TWITTER = 'TWITTER',
  MICROSOFT = 'MICROSOFT',
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
  DELETED = 'DELETED',
}

export class RegisterDTO {
  @IsEmail({}, { message: 'INVALID_EMAIL' })
  @IsNotEmpty()
  @ApiProperty()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({ required: true, type: 'string' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  readonly password: string;
}

export class LoginDTO extends RegisterDTO {
  @ApiProperty({ required: true, type: 'string' })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}

export class LoginSourcePayload {
  @ApiProperty({ type: 'string', required: true })
  @IsString()
  @IsNotEmpty()
  actionName: string;

  @ApiProperty({ type: 'string', required: true })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: 'string', required: true })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ type: 'number', required: true })
  @IsNumber()
  @IsNotEmpty()
  actionId: number;
}


export class LoginByPhoneDTO {
  @ApiProperty({ required: true, type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) =>
    CommonService.convertPhoneNum(value, ConvertPhoneNumAction.ADD_PHONE_CODE),
  )
  phone: string;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  readonly otp: string;

  @ApiProperty({ required: false, type: 'number' })
  @IsOptional()
  @IsNumber()
  invitedBy?: number;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  code?: string;
}

export class LoginSocialDTO {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  readonly token: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly tokenSecret: string;

  @IsNotEmpty()
  @ApiProperty({ type: 'string', enum: AccountType })
  @IsEnum(AccountType)
  readonly type: AccountType;

  @IsOptional()
  @ApiProperty()
  readonly firstName: string;

  @IsOptional()
  @ApiProperty()
  readonly lastName: string;
}
