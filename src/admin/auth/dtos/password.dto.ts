import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { ValidatePasswordFormat } from '../../../common/classes/validate-password';

export class ChangePasswordDTO {
  @ApiProperty({ required: true, type: 'string' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(256)
  readonly oldPassword: string;

  @ApiProperty({ required: true, type: 'string' })
  @IsString()
  @IsNotEmpty()
  @Validate(ValidatePasswordFormat)
  readonly newPassword: string;
}
