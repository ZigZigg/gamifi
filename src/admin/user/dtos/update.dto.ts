import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { UserStatus } from '../../../database/models/entities';

export class AdminUserUpdateUserDTO {
  @ApiProperty({
    type: 'string',
    nullable: true,
    enum: [UserStatus.BANNED, UserStatus.ACTIVE],
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum([UserStatus.BANNED, UserStatus.ACTIVE])
  status?: UserStatus;
}
