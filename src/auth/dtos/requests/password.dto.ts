import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class ResetPasswordDTO {
  @IsNotEmpty()
  @ApiProperty()
  readonly token: string;

  @ApiProperty({ required: true, type: 'string' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  readonly password: string;
}

export class ForgotPasswordDTO {
  @IsEmail({}, { message: 'INVALID_EMAIL' })
  @IsNotEmpty()
  @ApiProperty()
  @Transform(({ value }) => value.toLowerCase())
  readonly email: string;
}
