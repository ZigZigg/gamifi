import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ErrorCode } from '../../../../common/constants/errors';
import { REGEX_CONSTANTS } from '../../../../common/regex.constant';
import { UserRole } from '../../../../database/models/entities';

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
  fullName: string;

  @ApiProperty({ type: 'string', nullable: false, enum: UserRole })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}
