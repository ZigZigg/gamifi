import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Validate } from 'class-validator';
import { ValidatePasswordFormat } from '../../../../common/classes/validate-password';

export class SetPasswordDTO {
  @ApiProperty({ type: 'string', nullable: true })
  @IsOptional()
  @IsString()
  @Validate(ValidatePasswordFormat)
  password: string;
}
