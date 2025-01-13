import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { UserRole, UserStatus } from '../../../../database/models/entities';

export class AdminUpdateUserDTO {
  @ApiProperty({ type: 'string', nullable: true })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ type: 'string', nullable: true })
  @IsNotEmpty()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ type: 'string', nullable: true, enum: UserRole })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    type: 'string',
    nullable: true,
    enum: [UserStatus.BANNED, UserStatus.ACTIVE],
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum([UserStatus.BANNED, UserStatus.ACTIVE])
  status?: UserStatus;

  @ApiProperty({ type: 'string', nullable: false })
  @ValidateIf(({ role }) => role === UserRole.PUBLISHER)
  @IsNotEmpty()
  @IsNumber()
  merchantId: number;

  @ApiProperty({ type: 'string', nullable: false })
  @ValidateIf(({ role }) => role === UserRole.ADVERTISER)
  @IsNotEmpty()
  @IsString()
  campaign: string;
}
