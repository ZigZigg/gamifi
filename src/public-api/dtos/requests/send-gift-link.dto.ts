import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

import { ErrorCode } from '../../../common/constants/errors';
import { REGEX_CONSTANTS } from '../../../common/regex.constant';

export class SendGiftLinkDTO {
  @ApiProperty({ type: 'string', required: true })
  @Matches(REGEX_CONSTANTS.EMAIL, { message: ErrorCode.INVALID_EMAIL_FORMAT })
  @IsEmail()
  @MaxLength(50)
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ type: 'string', required: true })
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  actionName: string;
}

export class DecryptedData {
  email: string;
  phoneNumber;
  sourceId: number;
}
