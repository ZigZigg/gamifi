import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';


export enum VerifyLinkType {
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  VERIFY_LOGIN_FROM_GIFT_LINK = 'VERIFY_LOGIN_FROM_GIFT_LINK',
}

export class VerifyLinkDTO {
  @ApiProperty({ type: 'string', required: true, example: 'token' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    type: 'enum',
    required: true,
    default: VerifyLinkType.VERIFY_EMAIL,
  })
  @IsEnum(VerifyLinkType)
  @IsNotEmpty()
  type: VerifyLinkType = VerifyLinkType.VERIFY_EMAIL;
}

export class SendMailVerifyEmailDto {
  @ApiProperty({ type: 'string', required: true, example: 'example.gmail.com' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ type: 'string', required: true, example: 'name' })
  @IsString()
  name: string;

  @ApiProperty({ type: 'number', required: true, example: 1 })
  @IsNumber()
  userId: number;
}
