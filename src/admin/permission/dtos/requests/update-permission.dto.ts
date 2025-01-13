import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { PermissionRequestStatus } from '../../../../database/models/permission-request.entity';

export class UpdatePermissionRequestDTO {
  @IsOptional()
  @ApiProperty({
    type: 'string',
    enum: PermissionRequestStatus,
    required: false,
  })
  @IsEnum(PermissionRequestStatus)
  status: PermissionRequestStatus;
}
