import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { SortDirection } from '../constants/constants';

export class BasePageDTO {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @ApiProperty({ type: 'number', required: false, default: 10 })
  readonly limit: number = 10;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @ApiProperty({ type: 'number', required: false, default: 0 })
  readonly offset: number = 0;

  @ApiProperty({
    required: false,
    type: 'enum',
    enum: SortDirection,
    default: SortDirection.ASC,
  })
  @IsEnum(SortDirection)
  @IsNotEmpty()
  @IsOptional()
  sortDirection?: SortDirection = SortDirection.ASC;
}
