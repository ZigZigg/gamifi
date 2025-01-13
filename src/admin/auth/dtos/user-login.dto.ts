import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class LoginDTO {
  @IsEmail({}, { message: 'INVALID_EMAIL' })
  @IsNotEmpty()
  @ApiProperty()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({ required: true, type: 'string' })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
