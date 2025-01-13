import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class BaseDeleteDTO {
  @IsOptional()
  @ApiProperty({ type: 'boolean', required: false, default: false })
  readonly isHard: boolean = false;
}
